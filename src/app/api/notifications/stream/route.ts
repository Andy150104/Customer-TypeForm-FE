import { Agent } from "undici";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildTargetUrl = () => {
  const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!baseUrl) return "";
  return `${baseUrl.replace(/\/$/, "")}/api/v1/Notifications/stream`;
};

const encodeEvent = (data: string) =>
  new TextEncoder().encode(`${data}\n\n`);

export async function GET(request: Request) {
  const targetUrl = buildTargetUrl();
  if (!targetUrl) {
    return new Response("Missing API_URL/NEXT_PUBLIC_API_URL", { status: 500 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const headers: Record<string, string> = {
    accept: "text/event-stream",
  };

  if (authorization) {
    headers.authorization = authorization;
  }

  if (targetUrl.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  const allowInsecure =
    process.env.NODE_ENV !== "production" &&
    (targetUrl.startsWith("https://localhost") ||
      targetUrl.startsWith("https://127.0.0.1"));

  const dispatcher = allowInsecure
    ? new Agent({ connect: { rejectUnauthorized: false } })
    : undefined;

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => {
    if (!abortController.signal.aborted) {
      abortController.abort();
    }
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const safeEnqueue = (chunk: Uint8Array) => {
        if (!closed) {
          controller.enqueue(chunk);
        }
      };
      const safeClose = () => {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            // no-op: stream already closed
          }
        }
      };

      safeEnqueue(encodeEvent(": connected"));

      const pump = async () => {
        try {
          const fetchOptions: RequestInit = {
            method: "GET",
            headers,
            cache: "no-store",
            signal: abortController.signal,
          };
          const upstream = await (dispatcher
            ? (fetch as unknown as (
                input: RequestInfo | URL,
                init?: RequestInit & { dispatcher?: Agent },
              ) => Promise<Response>)(targetUrl, { ...fetchOptions, dispatcher })
            : fetch(targetUrl, fetchOptions));

          if (!upstream.ok || !upstream.body) {
            const errorText = upstream.body ? await upstream.text() : "";
            safeEnqueue(
              encodeEvent(
                `event: error\ndata: ${JSON.stringify({
                  status: upstream.status,
                  message: errorText || "Upstream stream error",
                })}`,
              ),
            );
            safeClose();
            return;
          }

          const reader = upstream.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            safeEnqueue(value);
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            const message =
              error instanceof Error ? error.message : "Stream fetch failed";
            safeEnqueue(
              encodeEvent(
                `event: error\ndata: ${JSON.stringify({ message })}`,
              ),
            );
          }
        } finally {
          safeClose();
        }
      };

      void pump();
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
