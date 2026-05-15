const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const SECRET_PATTERN = /(api[_-]?key|secret|token|password)\s*[:=]\s*['"]?([A-Za-z0-9_\-./=]{12,})/gi;

export function sanitizeText(value: string) {
  return value.replace(CONTROL_CHARS, "").replace(SECRET_PATTERN, "$1=[REDACTED]");
}
