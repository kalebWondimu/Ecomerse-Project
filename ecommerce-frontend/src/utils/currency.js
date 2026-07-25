const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ETB: 57,
  INR: 83,
  JPY: 156,
  CAD: 1.36,
  AUD: 1.52,
  AED: 3.67,
  CHF: 0.9,
};

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ETB: "Br",
  INR: "₹",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  AED: "د.إ",
  CHF: "CHF",
};

export const normalizeCurrencyCode = (currency) => {
  if (typeof currency !== "string") return "USD";
  const normalized = currency.trim().toUpperCase();
  return normalized.length > 0 ? normalized : "USD";
};

export const getCurrencySymbol = (currency) => {
  const code = normalizeCurrencyCode(currency);
  return CURRENCY_SYMBOLS[code] || code;
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  const fromCode = normalizeCurrencyCode(fromCurrency);
  const toCode = normalizeCurrencyCode(toCurrency);

  if (fromCode === toCode) {
    return numericAmount;
  }

  const fromRate = CURRENCY_RATES[fromCode] || 1;
  const toRate = CURRENCY_RATES[toCode] || 1;

  return numericAmount * (toRate / fromRate);
};

export const formatCurrency = (amount, currency, options = {}) => {
  const numericAmount = Number(amount || 0);
  const code = normalizeCurrencyCode(currency);
  const locale = options.locale || "en-US";
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;
  const symbol = getCurrencySymbol(code);

  const formattedAmount = numericAmount.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return `${symbol} ${formattedAmount}`;
};

export const getDisplayPrice = (amount, productCurrency, storeCurrency) => {
  return convertCurrency(amount, productCurrency, storeCurrency);
};
