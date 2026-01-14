// sessionStore.ts
import { readSidCookiePayload } from "./authServer"; // CHANGED: thay vì readIdtCookiePersist

export type Sid = string;

export interface TokenBundle {
  access: string;
  refresh: string;
  expAt: number; // epoch ms
}

// --- GIỮ MAP TOÀN CỤC, SỐNG QUA HMR ---
declare global {
   var __SESSION_MEM__: Map<Sid, TokenBundle> | undefined;
}
const mem: Map<Sid, TokenBundle> =
  globalThis.__SESSION_MEM__ ?? (globalThis.__SESSION_MEM__ = new Map());

export async function saveTokens(sid: Sid, tokens: TokenBundle) {
  mem.set(sid, tokens);
}

export async function loadTokens(sid: Sid) {
  const inMem = mem.get(sid);
  if (inMem) return inMem;

  // NEW: đọc payload ngay từ cookie sid
  const payload = await readSidCookiePayload();
  if (payload && payload.sid === sid) {
    mem.set(sid, { access: payload.access, refresh: payload.refresh, expAt: payload.expAt });
    return mem.get(sid)!;
  }
  return null;
}

export async function updateTokens(sid: Sid, tokens: Partial<TokenBundle>) {
  const cur = mem.get(sid);
  if (!cur) return;
  mem.set(sid, { ...cur, ...tokens });
}

export async function deleteSession(sid: Sid) {
  mem.delete(sid);
}

export function dumpSessionKeys() {
  return Array.from(mem.keys());
}
