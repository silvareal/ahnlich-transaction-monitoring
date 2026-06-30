import { PRESETS } from "../lib/presets";

export default function ScenarioPresets({ onSelect }) {
  return (
    <div className="reason-group">
      <span className="muted">Scenario presets</span>
      <div className="row" style={{ marginTop: "var(--space-2)" }}>
        {PRESETS.map((preset) => (
          <button key={preset.key} onClick={() => onSelect(preset.payload)}>
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
