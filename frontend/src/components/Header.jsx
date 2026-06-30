import { triggerSync } from "../api/client";

export default function Header({ health, onSynced }) {
  const dot = (ok) => ({ color: ok ? "var(--cleared)" : "var(--flagged)" });

  const handleSync = async () => {
    await triggerSync();
    onSynced();
  };

  return (
    <header className="panel">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>Ahnlich Anomaly Console</h2>
          <span className="muted">
            Vector-similarity signal on synthetic transaction monitoring
          </span>
        </div>
        <div className="row">
          {health && (
            <span className="row" style={{ gap: "var(--space-3)" }}>
              <span style={dot(health.postgres)}>● postgres</span>
              <span style={dot(health.ahnlich)}>● ahnlich</span>
              <span style={dot(health.pipeline_fitted)}>● pipeline</span>
            </span>
          )}
          <button onClick={handleSync}>Retrain (sync)</button>
        </div>
      </div>
    </header>
  );
}
