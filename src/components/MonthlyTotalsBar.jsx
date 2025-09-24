import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

// Colors: Bootstrap-style
const INCOME_COLOR = '#198754';  // success
const EXPENSE_COLOR = '#dc3545'; // danger

function toMonthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function labelOf(key) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}
const currencyFmt = (v) => (typeof v === 'number' ? `$${v.toFixed(2)}` : v);

/**
 * mode: 'grouped' | 'stacked'
 */
export default function MonthlyTotalsBar({ items, mode = 'grouped' }) {
  if (!items?.length)
    return <div className="alert alert-secondary">No data yet for monthly totals.</div>;

  // Aggregate by month
  const map = new Map();
  for (const t of items) {
    const k = toMonthKey(t.occurred_at);
    const row = map.get(k) || { key: k, Income: 0, Expense: 0 };
    if (t.type === 'income') row.Income += Number(t.amount);
    else row.Expense += Number(t.amount);
    map.set(k, row);
  }
  const data = Array.from(map.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((d) => ({ name: labelOf(d.key), Income: d.Income, Expense: d.Expense }));

  const stackId = mode === 'stacked' ? 'totals' : undefined;

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 16, right: 24, bottom: 28, left: 72 }} // prevent clipping
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickMargin={8} />
          <YAxis width={80} tickMargin={8} tickFormatter={currencyFmt} domain={[0, 'auto']} />
          <Tooltip formatter={(value) => currencyFmt(Number(value))} />
          <Legend />
          {/* Order matches legend: Expense (red), Income (green) */}
          <Bar dataKey="Expense" fill={EXPENSE_COLOR} stackId={stackId} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Income"  fill={INCOME_COLOR}  stackId={stackId} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
