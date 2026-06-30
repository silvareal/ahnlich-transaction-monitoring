import { currency, similarity } from "../lib/format";

export default function NeighborList({ neighbors }) {
  if (!neighbors?.length)
    return <p className="muted">No neighbors (store empty or unreachable).</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>tx id</th>
          <th>similarity</th>
          <th>label</th>
          <th>typology</th>
          <th>amount</th>
        </tr>
      </thead>
      <tbody>
        {neighbors.map((n, i) => (
          <tr key={i}>
            <td>{n.tx_id ?? "—"}</td>
            <td>{similarity(n.similarity)}</td>
            <td
              style={{
                color:
                  n.label === "flagged" ? "var(--flagged)" : "var(--cleared)",
              }}
            >
              {n.label}
            </td>
            <td>{n.fraud_scenario || "—"}</td>
            <td>{currency(n.order_price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
