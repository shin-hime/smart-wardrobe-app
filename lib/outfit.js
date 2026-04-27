// Pick one item per category for a simple "head to toe" OOTD view.

export function buildOutfitSlots(items) {
  const byCategory = {};
  for (const item of items) {
    const c = item.category;
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
  const accessory = first("accessory");
  

if (hat) rows.push({ label: "Hat", item: hat });
if (dress) {
  rows.push({ label: "Dress", item: dress });
} else {
  if (top) rows.push({ label: "Top", item: top });
  if (bottom) rows.push({ label: "Bottom", item: bottom });
}
if (bag) rows.push({ label: "Bag", item: bag }); 
if (shoes) rows.push({ label: "Shoes", item: shoes });
if (accessory) rows.push({ label: "Accessory", item: accessory }); // Outside the dress block
return rows;
}

// Suggest mode: random pick per category so users can get new ideas quickly.
export function buildSuggestedOutfitSlots(items) {
  const byCategory = {};
  for (const item of items) {
    const c = item.category;
    if (!byCategory[c]) byCategory[c] = [];
    byCategory[c].push(item);
  }

  function randomFrom(cat) {
    const list = byCategory[cat];
    if (!list || list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  const rows = [];
  const hat = randomFrom("hat");
  const dress = randomFrom("dress");
  const top = randomFrom("top");
  const bottom = randomFrom("bottom");
  const shoes = randomFrom("shoes");
  const bag = randomFrom("bag");
  const accessory = randomFrom("accessory");

 // 1. RANDOM LOGIC: Flip a coin (50/50 chance) to decide Dress vs Two-Piece
  const wantDress = Math.random() > 0.5;

  if (hat) rows.push({ label: "Hat", item: hat });

  if (wantDress && dress) {
    // If the coin flip says "Dress" and you have one, show it.
    rows.push({ label: "Dress", item: dress });
  } else {
    // If the coin flip says "Two-Piece" OR you don't have a dress
    if (top) rows.push({ label: "Top", item: top });
    if (bottom) rows.push({ label: "Bottom", item: bottom });

    // Fallback: If you have NO tops/bottoms but have a dress, show the dress anyway
  if (!top && !bottom && dress) rows.push({ label: "Dress", item: dress });
  }

  if (bag) rows.push({ label: "Bag", item: bag });
  if (shoes) rows.push({ label: "Shoes", item: shoes });
  if (accessory) rows.push({ label: "Accessory", item: accessory });

  return rows;
}