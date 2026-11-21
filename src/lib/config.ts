export const MATCH_WEIGHTS = {
  distance: 0.35,
  quantity: 0.2,
  deadline: 0.25,
  requirements: 0.2,
};

export const IMPACT_ASSUMPTIONS = {
  kgPerMeal: {
    value: 0.4,
    unit: "kg per meal",
    sourceNote: "Assumption, editable",
    version: 1,
  },
  co2eKgPerKg: {
    value: 2.5,
    unit: "kg CO2e per kg food",
    sourceNote: "PLACEHOLDER: must be sourced and verified before the pitch",
    version: 1,
  },
};
