const mojibakeRegex = /[\u00c3\u00c2\u00c4\u00c5\u00c6\u00d0\u00d8\u00de]/;
const replacementRegex = /[\uFFFD]/;
const suspiciousRegex = /[\u00b0\u00ba\u00aa]/;

const hasBrokenChars = (value: string) =>
  replacementRegex.test(value) ||
  /\?/.test(value) ||
  mojibakeRegex.test(value) ||
  suspiciousRegex.test(value);

const latin1ToUtf8 = (value: string) => {
  if (typeof TextDecoder !== "undefined") {
    try {
      const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      // fallback below
    }
  }

  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
};

const normalizeName = (value: string) => {
  const normalized = value.normalize("NFC");
  if (!normalized) return normalized;

  if (hasBrokenChars(normalized)) {
    const decoded = latin1ToUtf8(normalized).normalize("NFC");
    return hasBrokenChars(decoded) ? normalized : decoded;
  }

  return normalized;
};

export const normalizeDisplayName = (name?: string, email?: string) => {
  if (!name && !email) return "Người dùng";
  let next = normalizeName((name ?? "").trim());
  const cleaned = next.replace(/\?/g, "").replace(/\s+/g, " ").trim();
  if (cleaned && cleaned !== next) {
    next = cleaned;
  }
  next = next.normalize("NFC");

  // If still contains replacement chars, fallback to email local-part.
  if (!next || hasBrokenChars(next)) {
    const local = (email ?? "").split("@")[0] ?? "";
    if (local) {
      next = local
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return next || "Người dùng";
};
