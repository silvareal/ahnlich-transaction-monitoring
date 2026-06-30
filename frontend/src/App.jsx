import { useCallback, useEffect, useState } from "react";
import "./styles/tokens.css";
import "./App.css";
import {
  getHealth,
  getMeta,
  getTransactions,
  processTransaction,
} from "./api/client";
import DecisionFeed from "./components/DecisionFeed";
import Footer from "./components/Footer";
import Header from "./components/Header";
import TransactionForm from "./components/TransactionForm";
import VerdictPanel from "./components/VerdictPanel";

const DEFAULT_FORM = {
  // primary
  payment_type: "credit_card",
  product_category: "electronics",
  order_price: 129.99,
  billing_country: "US",
  hour: 14,
  // advanced / all fields
  customer_job: "Operator",
  customer_email: "synthetic@example.com",
  merchant: "DemoMerchant",
  user_agent: "demo-console",
  ip_address: "0.0.0.0",
  billing_city: "Synthville",
  billing_state: "NA",
  billing_zip: "00000",
  billing_latitude: 0,
  billing_longitude: 0,
};

const buildPayload = (form) => {
  const ts = new Date();
  ts.setUTCHours(Number(form.hour), 0, 0, 0);
  return {
    event_timestamp: ts.toISOString(),
    payment_type: form.payment_type,
    product_category: form.product_category,
    order_price: Number(form.order_price),
    billing_country: form.billing_country,
    customer_job: form.customer_job,
    customer_email: form.customer_email,
    merchant: form.merchant,
    user_agent: form.user_agent,
    ip_address: form.ip_address,
    billing_city: form.billing_city,
    billing_state: form.billing_state,
    billing_zip: form.billing_zip,
    billing_latitude: Number(form.billing_latitude),
    billing_longitude: Number(form.billing_longitude),
  };
};

export default function App() {
  const [meta, setMeta] = useState(null);
  const [health, setHealth] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [verdict, setVerdict] = useState(null);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const [h, txns] = await Promise.all([getHealth(), getTransactions(25)]);
    setHealth(h);
    setRows(txns);
  }, []);

  useEffect(() => {
    getMeta()
      .then(setMeta)
      .catch((e) => setError(e.message));
    refresh().catch((e) => setError(e.message));
    const id = setInterval(() => refresh().catch(() => {}), 5000);
    return () => clearInterval(id);
  }, [refresh]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      setVerdict(await processTransaction(buildPayload(form)));
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!meta) {
    return (
      <div className="app">
        <p className="muted">{error ? `Error: ${error}` : "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header health={health} onSynced={refresh} />
      {error && (
        <div className="panel" style={{ color: "var(--flagged)" }}>
          Error: {error}
        </div>
      )}
      <div className="grid">
        <TransactionForm
          form={form}
          setForm={setForm}
          meta={meta}
          onSubmit={submit}
          busy={busy}
        />
        <VerdictPanel verdict={verdict} />
      </div>
      <DecisionFeed rows={rows} />
      <Footer />
    </div>
  );
}
