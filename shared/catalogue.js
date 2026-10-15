import source from "./products.json" with { type: "json" };

const samplesById = {
  "pharma-cleanroom-wipes": "Cleanroom Wipes",
  "pharma-coveralls": "Pharmaceutical Coveralls",
  "pharma-shoe-covers": "Sterile Shoe Covers",
  "pharma-nitrile-gloves": "Nitrile Examination Gloves",
  "pharma-face-masks": "Pharmaceutical Face Masks",
  "pharma-sterile-pouches": "Sterilization Pouches",
  "pharma-labels": "Pharmaceutical Container Labels",
  "pharma-surface-disinfectant": "Surface Disinfectant",
  "food-sampling-bags": "Food Sample Collection Bags",
  "food-lab-sample-bottles": "Laboratory Sample Bottles",
  "food-ph-solution": "pH Buffer Solutions",
  "food-nitrile-gloves": "Food-Handling Nitrile Gloves",
  "food-hairnets": "Disposable Hair Nets",
  "food-surface-sanitizer": "Food-Contact Surface Sanitizer",
  "food-test-swabs": "Hygiene Test Swabs",
  "food-cleaning-wipes": "Food-Processing Cleaning Wipes",
  "food-sample-containers": "Food Sample Containers",
  "food-protective-aprons": "Protective Aprons",
  "food-packaging-liners": "Food-Grade Packaging Liners",
  "healthcare-exam-gloves": "Medical Examination Gloves",
  "healthcare-surgical-masks": "Surgical Face Masks",
  "healthcare-gauze-rolls": "Gauze Rolls",
  "healthcare-adhesive-dressings": "Adhesive Dressings",
  "healthcare-specimen-containers": "Specimen Containers",
  "healthcare-hand-sanitizer": "Hand Sanitizer",
  "healthcare-disposable-aprons": "Disposable Patient-Care Aprons",
  "healthcare-cotton-rolls": "Medical Cotton Rolls",
  "healthcare-wound-care-tape": "Wound-Care Adhesive Tape",
  "cleanroom-wipes": "Cleanroom Wipes",
  "cleanroom-coveralls": "Cleanroom Coveralls",
  "cleanroom-shoe-covers": "Cleanroom Shoe Covers",
  "cleanroom-face-masks": "Cleanroom Face Masks",
  "cleanroom-gloves": "Cleanroom Gloves",
  "cleanroom-sticky-mats": "Adhesive Cleanroom Mats",
  "cleanroom-caps": "Cleanroom Caps",
  "cleanroom-sleeve-covers": "Cleanroom Sleeve Covers",
  "cleanroom-surface-cleaner": "Cleanroom Surface Cleaner",
};

const sourceProducts = new Map(source.products.map((product) => [product.id, product]));
const categories = source.categories;
const productsById = new Map();

for (const category of categories) {
  for (const productId of category.productIds) {
    if (productsById.has(productId)) {
      productsById.get(productId).categoryIds.push(category.id);
      continue;
    }

    const published = sourceProducts.get(productId);
    const product = published
      ? { ...published, categoryIds: [category.id], illustrative: false }
      : {
          id: productId,
          name: samplesById[productId],
          subtitle: "Illustrative catalogue entry",
          description: `Sample product for ${category.name.toLowerCase()}. This item is shown as a catalogue placeholder, not a confirmed Maruti Chemicals offering.`,
          applications: [category.shortName, "Product sourcing on request"],
          features: ["Illustrative example only", "Confirm product availability", "Request approved specifications"],
          categoryIds: [category.id],
          illustrative: true,
        };
    productsById.set(productId, product);
  }
}

export const company = source.company;
export { categories };
export const products = [...productsById.values()];
export const catalogue = { company, categories, products };
