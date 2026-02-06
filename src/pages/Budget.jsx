export default function Budget() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Budget</h1>
      <form style={{ display: "grid", gap: 12, maxWidth: 320 }}>
        <label>
          Monthly budget
          <input type="number" step="0.01" placeholder="1000" />
        </label>

        <label>
          Buffer
          <input type="number" step="0.01" placeholder="100" />
        </label>

        <button type="button">Save (placeholder)</button>
      </form>
    </div>
  );
}