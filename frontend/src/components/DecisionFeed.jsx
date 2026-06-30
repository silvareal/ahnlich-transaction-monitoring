import { currency, hourOf, similarity, time } from "../lib/format";

export default function DecisionFeed({ rows }) {
  return (
    <section className="panel">
      <h2>Decision feed</h2>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>time</th>
            <th>type</th>
            <th>amount</th>
            <th>country</th>
            <th>hour</th>
            <th>similarity</th>
            <th>verdict</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{time(r.created_at)}</td>
              <td>{r.payment_type}</td>
              <td>{currency(r.order_price)}</td>
              <td>{r.billing_country}</td>
              <td>{hourOf(r.event_timestamp)}</td>
              <td>{similarity(r.similarity_score)}</td>
              <td
                style={{
                  color:
                    r.assigned_label === "flagged"
                      ? "var(--flagged)"
                      : r.assigned_label === "cleared"
                        ? "var(--cleared)"
                        : "var(--muted)",
                }}
              >
                {r.assigned_label || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
