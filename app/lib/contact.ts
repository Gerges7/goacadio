/** Safe public contact configuration and browser-only email composition. */
/** Public support address provided by the site owner. Not a private API key. */
export const OFFICIAL_SUPPORT_EMAIL = 'gergesmorad17@gmail.com';
export const CONTACT_TOPICS = ['technical', 'privacy', 'general'] as const;
export type ContactTopic = typeof CONTACT_TOPICS[number];

export function publicSupportEmail(value: unknown): string | null {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) return null;
  const email = value.trim();
  // The public address is explicitly provided by the site operator. Never invent one.
  if (email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(email)) return null;
  return email;
}

export function composeContactMailto(
  recipient: string,
  topic: ContactTopic,
  subject: string,
  message: string,
): string | null {
  const email = publicSupportEmail(recipient);
  const subjectText = subject.trim();
  const bodyText = message.trim();
  if (!email || !CONTACT_TOPICS.includes(topic) || subjectText.length < 4 || subjectText.length > 120 || bodyText.length < 10 || bodyText.length > 900) return null;
  const category = {technical: 'Technical support', privacy: 'Privacy / data request', general: 'General question'}[topic];
  const header = `GoAcadio — ${category}: ${subjectText}`;
  const body = `Category: ${category}\nSubject: ${subjectText}\n\n${bodyText}\n\n---\nSent by the visitor from the GoAcadio contact page.`;
  return `mailto:${email}?subject=${encodeURIComponent(header)}&body=${encodeURIComponent(body)}`;
}
