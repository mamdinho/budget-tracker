export default function TransactionsTable({ items, onEdit, onDelete, loading }) {
  if (loading) {
    return <div className="alert alert-info">Loading transactions…</div>;
  }
  if (!items?.length) {
    return <div className="alert alert-secondary">No transactions found.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th className="text-end">Amount</th>
            <th>Note</th>
            <th style={{width: 120}}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.occurred_at).toLocaleString()}</td>
              <td>
                <span className={`badge ${t.type === 'income' ? 'text-bg-success' : 'text-bg-danger'}`}>
                  {t.type}
                </span>
              </td>
              <td>{t.category}</td>
              <td className="text-end">${Number(t.amount).toFixed(2)}</td>
              <td className="text-truncate" style={{maxWidth: 260}} title={t.note || ''}>
                {t.note || '—'}
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary" onClick={()=>onEdit?.(t)}>Edit</button>
                  <button className="btn btn-outline-danger" onClick={()=>onDelete?.(t)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
