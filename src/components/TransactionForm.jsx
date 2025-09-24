import { useEffect, useState } from 'react';

const DEFAULT = {
  type: 'expense',
  amount: '',
  category: '',
  note: '',
  occurred_at: '',
};

export default function TransactionForm({ onSubmit, initial }) {
  const [f, setF] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (!initial) { setF(DEFAULT); return; }
    // Convert ISO -> datetime-local friendly string
    const iso = initial.occurred_at;
    const dt = iso ? new Date(iso) : new Date();
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString().slice(0,16);
    setF({
      type: initial.type,
      amount: String(initial.amount),
      category: initial.category,
      note: initial.note || '',
      occurred_at: local,
    });
  }, [initial]);

  function update(k, v) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type: f.type,
        amount: Number(f.amount),
        category: f.category.trim(),
        note: f.note.trim() || undefined,
        occurred_at: f.occurred_at
          ? new Date(f.occurred_at).toISOString()
          : new Date().toISOString(),
      };
      await onSubmit?.(payload);
      if (!isEdit) setF(DEFAULT);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="vstack gap-3" onSubmit={submit}>
      <div className="row g-2">
        <div className="col-6">
          <label className="form-label">Type</label>
          <select className="form-select" value={f.type} onChange={(e)=>update('type', e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="col-6">
          <label className="form-label">Amount</label>
          <input className="form-control" type="number" min="0" step="0.01"
                 value={f.amount} onChange={(e)=>update('amount', e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="form-label">Category</label>
        <input className="form-control" placeholder="e.g. Food, Rent, Travel"
               value={f.category} onChange={(e)=>update('category', e.target.value)} required />
      </div>

      <div>
        <label className="form-label">Note (optional)</label>
        <input className="form-control" value={f.note} onChange={(e)=>update('note', e.target.value)} />
      </div>

      <div>
        <label className="form-label">Date & time</label>
        <input className="form-control" type="datetime-local"
               value={f.occurred_at} onChange={(e)=>update('occurred_at', e.target.value)} />
      </div>

      <button className="btn btn-primary" disabled={saving}>
        {saving ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save Changes' : 'Add Transaction')}
      </button>
    </form>
  );
}
