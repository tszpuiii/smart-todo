export const LIST_PALETTE = ['red', 'cyan', 'yellow', 'teal', 'purple', 'pink', 'indigo', 'orange'];

export function buildListColorMap(lists = []) {
  const map = new Map();
  lists.forEach((list, index) => {
    const key = String(list.name || '').toLowerCase();
    if (!key) return;
    const color = list.color || LIST_PALETTE[index % LIST_PALETTE.length];
    map.set(key, color);
  });
  return map;
}

export function getListColorKey(category, colorMap) {
  const name = String(category || 'general').toLowerCase();
  if (colorMap?.has(name)) return colorMap.get(name);
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i)) % LIST_PALETTE.length;
  }
  return LIST_PALETTE[hash];
}
