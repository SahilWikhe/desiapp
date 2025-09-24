import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile';

export function normalizeToE164(raw, defaultRegion = 'US') {
  if (!raw) return '';
  const parsed = parsePhoneNumberFromString(String(raw), defaultRegion);
  return parsed?.isValid() ? parsed.number : '';
}


