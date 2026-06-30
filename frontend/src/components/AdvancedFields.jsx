// Collapsible editor for the remaining transaction fields. The text fields
// (job / merchant / user-agent) feed the embedding track, so editing them changes
// the vector and therefore the nearest-neighbour search.
const ADVANCED = [
  {
    key: "customer_job",
    label: "Customer job",
    type: "text",
    hint: "text track",
  },
  { key: "merchant", label: "Merchant", type: "text", hint: "text track" },
  { key: "user_agent", label: "User agent", type: "text", hint: "text track" },
  { key: "customer_email", label: "Customer email", type: "text" },
  { key: "ip_address", label: "IP address", type: "text" },
  { key: "billing_city", label: "Billing city", type: "text" },
  { key: "billing_state", label: "Billing state", type: "text" },
  { key: "billing_zip", label: "Billing ZIP", type: "text" },
  {
    key: "billing_latitude",
    label: "Billing latitude",
    type: "number",
    hint: "numeric track",
  },
  {
    key: "billing_longitude",
    label: "Billing longitude",
    type: "number",
    hint: "numeric track",
  },
];

export default function AdvancedFields({ form, update }) {
  return (
    <details className="advanced">
      <summary>All fields (advanced)</summary>
      <p className="muted advanced-note">
        Every field below is editable and sent with the transaction. Fields
        tagged “text track” / “numeric track” influence the similarity vector.
      </p>
      <div className="advanced-grid">
        {ADVANCED.map((f) => (
          <div className="field" key={f.key}>
            <label>
              {f.label}
              {f.hint && <span className="field-hint"> · {f.hint}</span>}
            </label>
            <input
              type={f.type}
              step={f.type === "number" ? "any" : undefined}
              value={form[f.key]}
              onChange={update(f.key)}
            />
          </div>
        ))}
      </div>
    </details>
  );
}
