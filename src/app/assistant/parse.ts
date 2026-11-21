export type DonationDraft = {
  title: string;
  foodCategory: string;
  isVegetarian: boolean;
  quantityValue: number;
  quantityUnit: "KG" | "SERVINGS";
  storageType: "AMBIENT" | "CHILLED" | "FROZEN";
  storageInstructions: string;
  allergens: string[];
  pickupDeadline: Date;
  consumeBy: Date;
  notes: string[];
};

const HOUR_MS = 60 * 60 * 1000;
const ALLERGENS = ["dairy", "nuts", "gluten", "egg", "soy", "seafood"];

export function parseDonationText(text: string, now: Date = new Date()): DonationDraft {
  const lower = text.toLowerCase();
  const notes: string[] = [];

  // "non veg" (and meat/fish words) wins over "veg" / "vegan".
  const nonVeg = /\b(non[\s-]?veg|chicken|mutton|fish)\b/.test(lower);
  const isVegetarian = !nonVeg && /\b(vegan|veg)\b/.test(lower);

  const qty = lower.match(/(\d+(?:\.\d+)?)\s*(plates?|packets?|servings?|kg)\b/);
  let quantityValue = 10;
  let quantityUnit: DonationDraft["quantityUnit"] = "SERVINGS";
  if (qty) {
    quantityValue = Number(qty[1]);
    quantityUnit = qty[2] === "kg" ? "KG" : "SERVINGS";
  } else {
    notes.push("quantity not found, please check");
  }

  let storageType: DonationDraft["storageType"] = "AMBIENT";
  if (/\bfrozen\b/.test(lower)) storageType = "FROZEN";
  else if (/\b(chilled|fridge|cold)\b/.test(lower)) storageType = "CHILLED";

  const storageInstructions =
    storageType === "FROZEN"
      ? "Keep frozen until pickup."
      : storageType === "CHILLED"
        ? "Keep chilled (refrigerated) until pickup."
        : "Store at room temperature; keep covered.";

  const allergens = ALLERGENS.filter((a) => new RegExp(`\\b${a}s?\\b`).test(lower));

  const within = lower.match(/within\s+(\d+(?:\.\d+)?)\s*hours?/);
  const pickupHours = within ? Number(within[1]) : 2;
  const pickupDeadline = new Date(now.getTime() + pickupHours * HOUR_MS);
  const consumeBy = new Date(
    Math.max(now.getTime() + 4 * HOUR_MS, pickupDeadline.getTime() + 2 * HOUR_MS),
  );

  const title = text
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title,
    foodCategory: isVegetarian ? "Vegetarian cooked food" : "Non-vegetarian cooked food",
    isVegetarian,
    quantityValue,
    quantityUnit,
    storageType,
    storageInstructions,
    allergens,
    pickupDeadline,
    consumeBy,
    notes,
  };
}
