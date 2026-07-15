const SHARE_HASH_KEY = "party";
const MAX_NAME_LENGTH = 10;
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 120;

export type SharePayload = {
  n: string;
  m?: string[];
};

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(`${base64}${padding}`);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function isSharePayload(value: unknown): value is SharePayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;
  if (
    typeof payload.n !== "string" ||
    payload.n.trim().length === 0 ||
    payload.n.trim().length > MAX_NAME_LENGTH
  ) {
    return false;
  }

  if (payload.m === undefined) return true;

  return (
    Array.isArray(payload.m) &&
    payload.m.length <= MAX_MESSAGES &&
    payload.m.every(
      (message) =>
        typeof message === "string" &&
        message.trim().length > 0 &&
        message.trim().length <= MAX_MESSAGE_LENGTH,
    )
  );
}

export function createShareHash(payload: SharePayload) {
  return `${SHARE_HASH_KEY}=${toBase64Url(JSON.stringify(payload))}`;
}

export function parseShareHash(hash: string): SharePayload | null {
  try {
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const encodedPayload = params.get(SHARE_HASH_KEY);

    if (!encodedPayload) return null;

    const parsedPayload: unknown = JSON.parse(fromBase64Url(encodedPayload));
    if (!isSharePayload(parsedPayload)) return null;

    const messages = parsedPayload.m?.map((message) => message.trim());

    return {
      n: parsedPayload.n.trim(),
      ...(messages?.length ? { m: messages } : {}),
    };
  } catch {
    return null;
  }
}
