// Two clearly separated groups — neighbor evidence (how the vote went) vs.
// intrinsic transaction features (what's odd about this transaction on its own) —
// plus the honest under-flag note when applicable. Never conflated.
export default function ReasonBreakdown({ reasons }) {
  if (!reasons) return null;
  return (
    <div>
      <div className="reason-group">
        <span className="muted">Neighbor evidence — how the vote went</span>
        <ul>
          {reasons.neighbor_evidence.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="reason-group">
        <span className="muted">
          Transaction features — what&apos;s odd about it on its own
        </span>
        {reasons.transaction_features.length ? (
          <ul>
            {reasons.transaction_features.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">No intrinsic oddities detected.</p>
        )}
      </div>

      {reasons.under_flag_note && (
        <div className="under-flag">
          <strong>⚠ Model limitation:</strong> {reasons.under_flag_note}
        </div>
      )}
    </div>
  );
}
