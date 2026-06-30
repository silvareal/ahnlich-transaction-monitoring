// Scenario presets for the demo. These shape the *input* transaction; the verdict
// still comes from similarity voting against the store — presets do not force it.
// Each preset is a full record so selecting it populates the advanced fields too.

const isoAtHour = (hour) => {
  const d = new Date();
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

const US = {
  customer_email: "synthetic@example.com",
  billing_city: "Austin",
  billing_state: "TX",
  billing_zip: "73301",
  billing_latitude: 30.27,
  billing_longitude: -97.74,
  ip_address: "73.12.40.7",
  user_agent: "Mozilla/5.0",
};

const NG = (city, state, lat, lng) => ({
  customer_email: "synthetic@example.ng",
  billing_city: city,
  billing_state: state,
  billing_zip: "100001",
  billing_latitude: lat,
  billing_longitude: lng,
  ip_address: "197.210.45.12",
  user_agent: "Android USSD/Mobile",
});

const LAGOS = NG("Lagos", "LA", 6.45, 3.39);

export const PRESETS = [
  {
    key: "retail",
    label: "Retail (normal)",
    payload: {
      ...US,
      payment_type: "credit_card",
      product_category: "electronics",
      order_price: 129.99,
      billing_country: "US",
      customer_job: "Accountant",
      merchant: "ShopRite Online",
      event_timestamp: isoAtHour(14),
    },
  },
  {
    key: "card_testing",
    label: "Card testing",
    payload: {
      ...US,
      payment_type: "credit_card",
      product_category: "digital_goods",
      order_price: 1.5,
      billing_country: "US",
      customer_job: "Unknown",
      merchant: "QuickPay Gateway",
      user_agent: "python-requests/2.31",
      event_timestamp: isoAtHour(13),
    },
  },
  {
    key: "structuring",
    label: "Structuring",
    payload: {
      ...US,
      payment_type: "wire",
      product_category: "jewelry",
      order_price: 9500,
      billing_country: "US",
      customer_job: "Consultant",
      merchant: "Apex Holdings LLC",
      event_timestamp: isoAtHour(11),
    },
  },
  {
    key: "whale",
    label: "Whale anomaly",
    payload: {
      ...US,
      payment_type: "credit_card",
      product_category: "travel",
      order_price: 90000,
      billing_country: "US",
      customer_job: "Executive",
      merchant: "LuxJet Charter",
      event_timestamp: isoAtHour(15),
    },
  },
  {
    key: "account_takeover",
    label: "Account takeover",
    payload: {
      customer_email: "synthetic@example.com",
      billing_city: "Moscow",
      billing_state: "MOW",
      billing_zip: "101000",
      billing_latitude: 55.75,
      billing_longitude: 37.61,
      ip_address: "45.83.12.9",
      user_agent: "curl/8.0",
      payment_type: "credit_card",
      product_category: "electronics",
      order_price: 800,
      billing_country: "RU",
      customer_job: "Account holder",
      merchant: "GadgetMart",
      event_timestamp: isoAtHour(3),
    },
  },
  // --- CBN (Central Bank of Nigeria) demonstration typologies ---
  {
    key: "fx_structuring",
    label: "CBN · FX structuring",
    payload: {
      ...LAGOS,
      payment_type: "bank_transfer",
      product_category: "fx_remittance",
      order_price: 9600,
      billing_country: "NG",
      customer_job: "Importer",
      merchant: "NaijaFX Bureau",
      event_timestamp: isoAtHour(11),
    },
  },
  {
    key: "crypto_fx_evasion",
    label: "CBN · Crypto FX evasion",
    payload: {
      ...LAGOS,
      payment_type: "crypto",
      product_category: "fx_remittance",
      order_price: 45000,
      billing_country: "NG",
      customer_job: "Trader",
      merchant: "P2PCoin Exchange",
      event_timestamp: isoAtHour(2),
    },
  },
  {
    key: "pos_agent_cashout",
    label: "CBN · POS agent cash-out",
    payload: {
      ...NG("Kano", "KN", 12.0, 8.52),
      payment_type: "pos",
      product_category: "grocery",
      order_price: 1800,
      billing_country: "NG",
      customer_job: "POS agent",
      merchant: "AgentPOS Terminal",
      event_timestamp: isoAtHour(20),
    },
  },
  {
    key: "ussd_micro_burst",
    label: "CBN · USSD micro-burst",
    payload: {
      ...LAGOS,
      payment_type: "ussd",
      product_category: "airtime",
      order_price: 1.2,
      billing_country: "NG",
      customer_job: "Student",
      merchant: "MTN USSD Topup",
      event_timestamp: isoAtHour(13),
    },
  },
  {
    key: "sim_swap_takeover",
    label: "CBN · SIM-swap takeover",
    payload: {
      ...NG("Abuja", "FC", 9.06, 7.49),
      payment_type: "bank_transfer",
      product_category: "electronics",
      order_price: 7000,
      billing_country: "NG",
      customer_job: "Account holder",
      merchant: "ElectroHub NG",
      ip_address: "102.89.33.5",
      user_agent: "okhttp/4.9 (rooted)",
      event_timestamp: isoAtHour(3),
    },
  },
];
