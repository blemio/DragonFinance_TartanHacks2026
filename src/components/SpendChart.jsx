import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Build 7-day spending data from the spendings array.
 */
function buildWeekData(spendings) {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const total = spendings
      .filter((s) => s.date === key)
      .reduce((sum, s) => sum + s.amount, 0);
    days.push({ name: label, amount: parseFloat(total.toFixed(2)) });
  }
  return days;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-value">${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function SpendChart({ spendings }) {
  const data = buildWeekData(spendings);
  const maxVal = Math.max(...data.map((d) => d.amount), 10);

  return (
    <div className="card spend-chart-card">
      <h3 className="spend-chart-title">7-Day Spending</h3>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e8783a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e8783a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#8c8685" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8c8685" }}
              axisLine={false}
              tickLine={false}
              domain={[0, Math.ceil(maxVal * 1.2)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#e8783a"
              strokeWidth={2.5}
              fill="url(#spendGrad)"
              dot={{ r: 3, fill: "#e8783a", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#e8783a", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
