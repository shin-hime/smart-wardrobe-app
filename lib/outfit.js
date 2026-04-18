// Pick one item per category for a simple "head to toe" OOTD view.

export function buildOutfitSlots(items) {
  const byCategory = {};
  for (const item of items) {
    const c = item.category || "top";
    if (!byCategory[c]) byCategory[c] = [];
    byCategory[c].push(item);
  }

  function first(cat) {
    const list = byCategory[cat];
    if (!list || list.length === 0) return null;
    return list[0];
  }

  const rows = [];
  const hat = first("hat");
  const dress = first("dress");
  const top = first("top");
  const bottom = first("bottom");
  const shoes = first("shoes");
  const bag = first("bag");

  if (hat) rows.push({ label: "Hat / accessory", item: hat });
  if (dress) {
    rows.push({ label: "Dress", item: dress });
  } else {
    if (top) rows.push({ label: "Top", item: top });
    if (bottom) rows.push({ label: "Bottom", item: bottom });
  }
  if (shoes) rows.push({ label: "Shoes", item: shoes });
  if (bag) rows.push({ label: "Bag", item: bag });

  return rows;
}
