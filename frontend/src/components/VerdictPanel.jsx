import {
  similarity,
  verdictColor,
  verdictSummary,
  voteDots,
} from "../lib/format";
import NeighborList from "./NeighborList";
import ReasonBreakdown from "./ReasonBreakdown";

export default function VerdictPanel({ verdict }) {
  if (!verdict) {
    return (
      <section className="panel">
        <h2>Real-time verdict</h2>
        <p className="muted">Submit a transaction to see a decision.</p>
      </section>
    );
  }

  const scored = verdict.verdict !== "deferred";

  return (
    <section className="panel">
      <h2>Real-time verdict</h2>

      <span className="score" style={{ color: verdictColor(verdict.verdict) }}>
        {verdict.verdict.toUpperCase()}
      </span>
      <p className="verdict-summary">{verdictSummary(verdict)}</p>

      {scored && (
        <div className="verdict-metrics">
          <div className="metric">
            <span
              className="metric-label"
              title="Average cosine similarity to the 5 nearest past cases. Higher = more like its neighbours — this is NOT a fraud probability."
            >
              avg similarity to {verdict.k} nearest cases ⓘ
            </span>
            <span className="metric-value">{similarity(verdict.score)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">flagged neighbours</span>
            <span className="metric-value">
              <span className="dots" aria-hidden="true">
                {voteDots(verdict.fraud_votes, verdict.k)}
              </span>{" "}
              {verdict.fraud_votes}/{verdict.k}
            </span>
          </div>
        </div>
      )}

      <div style={{ marginTop: "var(--space-4)" }}>
        <ReasonBreakdown reasons={verdict.reasons} />
      </div>

      {scored && (
        <div className="reason-group">
          <span className="muted">Nearest-neighbor basis</span>
          <NeighborList neighbors={verdict.neighbors} />
        </div>
      )}

      {scored && (
        <p className="latency-note">
          Ahnlich k-NN query time: <strong>{verdict.latency_ms} ms</strong>
          <span className="muted"> · measured, not asserted</span>
        </p>
      )}
    </section>
  );
}
