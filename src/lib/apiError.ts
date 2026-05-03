/** Turn Spring Boot error JSON (or plain text) into a short user-facing string. */
export function formatApiErrorBody(body: string, fallbackStatus?: number): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return fallbackStatus != null
      ? `Request failed (${fallbackStatus})`
      : "Request failed";
  }

  try {
    const j = JSON.parse(trimmed) as Record<string, unknown>;
    const errors = j.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const parts = errors
        .map((e: unknown) => {
          if (e && typeof e === "object" && "defaultMessage" in e) {
            const m = (e as { defaultMessage?: string }).defaultMessage;
            return typeof m === "string" ? m : "";
          }
          return "";
        })
        .filter(Boolean);
      if (parts.length) return parts.join(" ");
    }
    const msg = j.message;
    if (typeof msg === "string" && msg && !/^Validation failed\b/.test(msg)) {
      return msg;
    }
    const path = j.path;
    if (typeof path === "string" && typeof j.status === "number") {
      return `Error ${j.status} (${path})`;
    }
  } catch {
    /* not JSON */
  }

  return trimmed;
}
