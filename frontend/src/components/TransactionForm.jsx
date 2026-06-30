import AdvancedFields from "./AdvancedFields";
import ScenarioPresets from "./ScenarioPresets";

const FIELD = (label, children) => (
  <div className="field" key={label}>
    <label>{label}</label>
    {children}
  </div>
);

export default function TransactionForm({
  form,
  setForm,
  meta,
  onSubmit,
  busy,
}) {
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const applyPreset = (payload) => {
    const { event_timestamp, ...fields } = payload;
    // Apply every field the preset specifies (primary + advanced); derive the
    // hour control from the preset timestamp.
    setForm({
      ...form,
      ...fields,
      hour: new Date(event_timestamp).getUTCHours(),
    });
  };

  return (
    <section className="panel">
      <h2>Create transaction</h2>
      <ScenarioPresets onSelect={applyPreset} />

      {FIELD(
        "Payment type",
        <select value={form.payment_type} onChange={update("payment_type")}>
          {meta.payment_types.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>,
      )}
      {FIELD(
        "Product category",
        <select
          value={form.product_category}
          onChange={update("product_category")}
        >
          {meta.product_categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>,
      )}
      {FIELD(
        "Amount (USD)",
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.order_price}
          onChange={update("order_price")}
        />,
      )}
      {FIELD(
        "Billing country",
        <select
          value={form.billing_country}
          onChange={update("billing_country")}
        >
          {meta.billing_countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>,
      )}
      {FIELD(
        "Hour of day (UTC)",
        <input
          type="number"
          min="0"
          max="23"
          value={form.hour}
          onChange={update("hour")}
        />,
      )}

      <AdvancedFields form={form} update={update} />

      <button
        onClick={onSubmit}
        disabled={busy}
        style={{ marginTop: "var(--space-2)" }}
      >
        {busy ? "Scoring…" : "Submit for decision"}
      </button>
    </section>
  );
}
