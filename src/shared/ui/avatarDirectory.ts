/**
 * Bridge for places that only hold a display name (evidence sheets, corkboard, suspect cards).
 * Records that carry an `avatarIndex` pass it straight to ContactAvatar and never touch this map.
 * The case loader fills it from contacts/people data, so renaming someone in data keeps the photo.
 */
export const normalizeAvatarName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLocaleLowerCase('vi')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const avatarIndexByName = new Map<string, number>();

export function registerAvatarNames(entries: Iterable<readonly [string, number]>) {
  for (const [name, index] of entries) avatarIndexByName.set(normalizeAvatarName(name), index);
}

export const avatarIndexForName = (name: string): number | undefined => avatarIndexByName.get(normalizeAvatarName(name));
