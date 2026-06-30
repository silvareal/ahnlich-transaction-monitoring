export default function Footer() {
  return (
    <footer className="footer">
      Similarity-signal demonstration on <strong>synthetic</strong> data. Labels
      are unsupervised statistical outliers (Isolation Forest) —{" "}
      <strong>outlier ≠ confirmed fraud</strong>. This is not a deployable
      fraud-detection system; in reality this signal is one input among
      supervised models, rules, velocity/device/geo features, and human review.
      Latency shown is measured by the running system.
    </footer>
  );
}
