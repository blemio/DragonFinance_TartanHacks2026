export default function AddPurchase() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Add Purchase</h1>
      <form style={{ display: "grid", gap: 12, maxWidth: 320 }}>
        <label>
          Amount
          <input type="number" step="0.01" placeholder="12.34" />
        </label>

        <label>
          Merchant
          <input type="text" placeholder="Starbucks" />
        </label>

        <button type="button">Save (placeholder)</button>
      </form>
    </div>
  );
}