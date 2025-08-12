import * as Contacts from 'expo-contacts';
import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile';

export async function getNormalizedPhones(defaultRegion = 'US') {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') return [];

  const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
  const phones = new Set();
  for (const c of data) {
    for (const p of (c.phoneNumbers ?? [])) {
      const parsed = parsePhoneNumberFromString(p.number || '', defaultRegion);
      if (parsed?.isValid()) phones.add(parsed.number);
    }
  }
  return Array.from(phones);
}


