/** Default monthly expense caps (₦) — MVP placeholders until user-editable budgets exist */
export const DEFAULT_MONTHLY_CATEGORY_BUDGETS = {
  Food: 80000,
  Transport: 35000,
  Rent: 150000,
  Utilities: 25000,
  Shopping: 40000,
  Entertainment: 30000,
  Health: 20000,
  General: 50000,
};

export function monthlyBudgetForCategory(categoryName) {
  const key = typeof categoryName === "string" ? categoryName.trim() : "";
  if (!key) return DEFAULT_MONTHLY_CATEGORY_BUDGETS.General;
  return DEFAULT_MONTHLY_CATEGORY_BUDGETS[key] ?? DEFAULT_MONTHLY_CATEGORY_BUDGETS.General;
}
