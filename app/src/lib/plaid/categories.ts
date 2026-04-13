// Maps Plaid personal_finance_category to Warren Chart of Accounts codes

const DETAILED_MAP: Record<string, string> = {
  "FOOD_AND_DRINK.RESTAURANTS": "P-DIN",
  "FOOD_AND_DRINK.COFFEE": "P-DIN",
  "FOOD_AND_DRINK.FAST_FOOD": "P-DIN",
  "FOOD_AND_DRINK.GROCERIES": "P-GRC",
  "RENT_AND_UTILITIES.RENT": "P-HOU",
  "RENT_AND_UTILITIES.GAS_AND_ELECTRICITY": "P-UTL",
  "RENT_AND_UTILITIES.WATER": "P-UTL",
  "RENT_AND_UTILITIES.INTERNET_AND_CABLE": "P-UTL",
  "RENT_AND_UTILITIES.TELEPHONE": "P-UTL",
  "GENERAL_MERCHANDISE.CLOTHING_AND_ACCESSORIES": "P-CLO",
  "GENERAL_MERCHANDISE.SPORTING_GOODS": "P-MSC",
  "GENERAL_MERCHANDISE.ELECTRONICS": "P-MSC",
  "HOME_IMPROVEMENT.FURNITURE": "P-HOU",
  "HOME_IMPROVEMENT.HARDWARE": "P-HOU",
};

const PRIMARY_MAP: Record<string, string> = {
  FOOD_AND_DRINK: "P-GRC",
  TRANSPORTATION: "P-TRN",
  RENT_AND_UTILITIES: "P-UTL",
  MEDICAL: "P-HLT",
  PERSONAL_CARE: "P-HLT",
  TRAVEL: "P-TRV",
  ENTERTAINMENT: "P-DIN",
  HOME_IMPROVEMENT: "P-HOU",
  GENERAL_MERCHANDISE: "P-MSC",
  LOAN_PAYMENTS: "P-DEB",
  INSURANCE: "P-INS",
  CHILDCARE: "P-CHD",
  GOVERNMENT_AND_NON_PROFIT: "P-MSC",
  TRANSFER_IN: "P-MSC",
  TRANSFER_OUT: "P-MSC",
  BANK_FEES: "P-MSC",
};

// Business-related merchants or categories
const BUSINESS_KEYWORDS = [
  "aws", "amazon web services", "github", "openai", "anthropic",
  "google cloud", "azure", "digitalocean", "vercel", "render",
  "adobe", "figma", "notion", "slack", "zoom",
  "aitheia", "consulting",
];

export function mapPlaidCategory(
  primary?: string | null,
  detailed?: string | null,
  merchantName?: string | null
): { category: string; personalOrBusiness: "personal" | "business" } {
  // Check for business transaction
  const merchant = (merchantName || "").toLowerCase();
  const isBusiness = BUSINESS_KEYWORDS.some((kw) => merchant.includes(kw));

  if (isBusiness) {
    // Map to closest business category
    if (merchant.includes("travel") || merchant.includes("airline") || merchant.includes("hotel")) {
      return { category: "B-TRV", personalOrBusiness: "business" };
    }
    if (primary === "FOOD_AND_DRINK") {
      return { category: "B-MSC", personalOrBusiness: "business" };
    }
    return { category: "B-SOF", personalOrBusiness: "business" };
  }

  // Try detailed mapping first
  if (primary && detailed) {
    const detailedKey = `${primary}.${detailed}`;
    if (DETAILED_MAP[detailedKey]) {
      return { category: DETAILED_MAP[detailedKey], personalOrBusiness: "personal" };
    }
  }

  // Fall back to primary mapping
  if (primary && PRIMARY_MAP[primary]) {
    return { category: PRIMARY_MAP[primary], personalOrBusiness: "personal" };
  }

  return { category: "P-MSC", personalOrBusiness: "personal" };
}
