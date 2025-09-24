import { useEffect, useMemo, useState } from 'react';

// Debounce helper
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function FiltersBar({ value, onApply, onClear, fetchCategories }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const [suggestions, setSuggestions] = useState([]);
  const debouncedQ = useDebounced(local.category, 200);

  // Fetch suggestions when type/category change
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        if (!fetchCategories) return;
        const q = (debouncedQ || '').trim();
        if (!q && !local.type) { setSuggestions([]); return; }
        const list = await fetchCategories({
          q: q || '',
          type: local.type || undefined,
        });
        if (!canceled) setSuggestions(list || []);
      } catch {
        if (!canceled) setSuggestions([]);
      }
    })();
    return () => (canceled = true);
  }, [debouncedQ, local.type, fetchCategories]);

  function update(k, v) { setLocal(prev => ({ ...prev, [k]: v })); }

  function apply(e) {
    e?.preventDefault?.();
    onApply?.(local); // 👈 single source of truth
  }

  function clear() {
    const empty = { from: '', to: '', type: '', category: '' };
    setLocal(empty);
    onClear?.(empty); // 👈 parent updates filters; effect loads
  }

  // Datalist id (unique per instance)
  const listId = useMemo(() => 'cats-' + Math.random().toString(36).slice(2), []);

  return (
    <form className="row g-2 gy-3 align-items-end" onSubmit={apply}>
      <div className="col-12 col-sm-6 col-lg-3">
        <label className="form-label">From</label>
        <input type="date" className="form-control"
               value={local.from || ''} onChange={(e)=>update('from', e.target.value)} />
      </div>

      <div className="col-12 col-sm-6 col-lg-3">
        <label className="form-label">To</label>
        <input type="date" className="form-control"
               value={local.to || ''} onChange={(e)=>update('to', e.target.value)} />
      </div>

      <div className="col-6 col-lg-2">
        <label className="form-label">Type</label>
        <select className="form-select" value={local.type}
                onChange={(e)=>update('type', e.target.value)}>
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="col-6 col-lg-2">
        <label className="form-label">Category</label>
        <input className="form-control" placeholder="e.g. Food" list={listId}
               value={local.category} onChange={(e)=>update('category', e.target.value)} />
        <datalist id={listId}>
          {suggestions.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>

      <div className="col-12 col-lg-2">
        {/* Stack on mobile, wrap on desktop to avoid overflow */}
        <div className="d-grid gap-2 d-lg-flex flex-lg-wrap justify-content-lg-end">
          <button className="btn btn-primary" type="submit">Apply</button>
          <button className="btn btn-outline-secondary" type="button" onClick={clear}>Clear</button>
        </div>
      </div>
    </form>
  );
}
