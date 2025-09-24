import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

const COLORS = ['#0d6efd','#6610f2','#198754','#dc3545','#fd7e14','#20c997','#6f42c1','#0dcaf0','#ffc107','#6c757d'];

export default function SpendingByCategoryPie({ data }) {
  // Normalize -> hide zero-valued slices
  const chartData = (data || [])
    .map((d, i) => ({
      name: d.category,
      value: Number(d.total ?? d.spent ?? 0),
      color: COLORS[i % COLORS.length],
    }))
    .filter(d => d.value > 0);

  if (!chartData.length) return <div className="alert alert-secondary">No category data.</div>;

  // Build a legend that uses the same colors as slices
  const legendPayload = chartData.map(d => ({
    id: d.name,
    type: 'square',
    value: d.name,
    color: d.color,
  }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={chartData} outerRadius={110} label>
            {chartData.map((d, idx) => (
              <Cell key={d.name + idx} fill={d.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend payload={legendPayload} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
