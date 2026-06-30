// Shared formatting helpers, defined once.

export const currency = (value) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);

export const similarity = (value) => (value == null ? "—" : value.toFixed(3));

export const time = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", { hour12: false });
};

export const hourOf = (iso) => (iso ? new Date(iso).getUTCHours() : null);

export const verdictColor = (verdict) => {
  if (verdict === "flagged") return "var(--flagged)";
  if (verdict === "cleared") return "var(--cleared)";
  return "var(--deferred)";
};

// Votes needed to flag under majority rule (votes * 2 > k).
export const votesNeeded = (k) => Math.floor(k / 2) + 1;

// A filled/empty dot strip visualising flagged neighbours out of k.
export const voteDots = (votes, k) =>
  "●".repeat(votes) + "○".repeat(Math.max(0, k - votes));

// One plain-language sentence describing the decision.
export const verdictSummary = ({ verdict, fraud_votes, k }) => {
  if (verdict === "deferred") {
    return "Not scored — the row was saved, but no fitted model or reachable store was available.";
  }
  const needed = votesNeeded(k);
  if (verdict === "flagged") {
    return `Flagged — ${fraud_votes} of ${k} most-similar past cases were flagged (${needed} needed).`;
  }
  return `Cleared — only ${fraud_votes} of ${k} most-similar past cases were flagged (${needed} needed to flag).`;
};
