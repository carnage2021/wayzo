/** Option lists shared by server schemas and client forms (no Zod import). */
export const TRAVELS_WITH = ["Solo", "Partner", "Friends", "Family"] as const;
export type TravelsWith = (typeof TRAVELS_WITH)[number];

export const FOOD_PREFS = [
  "No restrictions",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
] as const;
export type FoodPref = (typeof FOOD_PREFS)[number];
