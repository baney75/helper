const PHONE_RE =
  /(2-1-1|\+?1[-.\s]*\(\d{3}\)[-.\s]*\d{3}[-.\s]*\d{4}|\+?1[-.\s]*\d{3}[-.\s]*\d{3}[-.\s]*\d{4}|\(\d{3}\)[-.\s]*\d{3}[-.\s]*\d{4}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/g;

export function telHref(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "211") return "tel:211";
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${digits}`;
}

export function fillWithPhoneLinks(el: HTMLElement, text: string): void {
  el.replaceChildren();
  PHONE_RE.lastIndex = 0;
  let last = 0;
  let match: RegExpExecArray | null = PHONE_RE.exec(text);
  if (!match) {
    el.textContent = text;
    return;
  }
  while (match) {
    if (match.index > last) {
      el.append(text.slice(last, match.index));
    }
    const a = document.createElement("a");
    a.href = telHref(match[0]);
    a.textContent = match[0];
    el.append(a);
    last = match.index + match[0].length;
    match = PHONE_RE.exec(text);
  }
  if (last < text.length) el.append(text.slice(last));
}
