import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../lib/api';
import FiltersBar from '../components/FiltersBar';
import TransactionForm from '../components/TransactionForm';
import TransactionsTable from '../components/TransactionsTable';
import SpendingByCategoryPie from '../components/SpendingByCategoryPie';
import MonthlyTotalsBar from '../components/MonthlyTotalsBar';
import PaginationBar from '../components/PaginationBar';

function toISODate(d) {
  if (!d) return undefined;
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0)).toISOString();
}

function buildQueryParams(f) {
  const q = {};
  if (f.type) q.type = f.type;
  if (f.category) q.category = f.category.trim();
  if (f.from) q.from = toISODate(f.from);
  if (f.to) {
    const dt = new Date(f.to);
    dt.setDate(dt.getDate() + 1); // exclusive "to": include the day
    q.to = dt.toISOString();
  }
  return q;
}

export default function Dashboard() {
  const { user } = useAuth();
  const api = useApi();

  // Filters
  const [filters, setFilters] = useState({ from: '', to: '', type: '', category: '' });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Summary
  const [summary, setSummary] = useState({
    income: '0',
    expense: '0',
    byExpenseCategory: [],
    byIncomeCategory: [],
  });

  // Editing state
  const [editing, setEditing] = useState(null);

  // Chart modes
  const [chartMode, setChartMode] = useState('expense');  // 'expense' | 'income'
  const [totalsMode, setTotalsMode] = useState('grouped'); // 'grouped' | 'stacked'

  async function loadAll(curPage = page) {
    setLoading(true);
    setErr('');
    try {
      const qp = buildQueryParams(filters);
      const [listRes, sum] = await Promise.all([
        api.listTransactions({ ...qp, page: curPage, pageSize }),
        api.getSummary({ ...qp }),
      ]);
      setItems(listRes.items);
      setTotal(listRes.total);
      setSummary(sum);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // Load whenever page OR filters change
  useEffect(() => {
    loadAll(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  // CSV export (all matching rows)
  async function exportCSV() {
    try {
      setErr('');
      const all = [];
      const qpBase = buildQueryParams(filters);
      let cur = 1;
      while (true) {
        const { items, total: t } = await api.listTransactions({ ...qpBase, page: cur, pageSize: 500 });
        all.push(...items);
        if (all.length >= t) break;
        cur += 1;
      }
      const headers = ['id','type','amount','category','note','occurred_at','created_at','updated_at'];
      const lines = [headers.join(',')].concat(
        all.map(r => headers.map(h => csvEscape(r[h])).join(','))
      );
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  function csvEscape(v) {
    if (v === null || v === undefined) return '';
    let s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  async function handleCreate(payload) {
    await api.createTransaction(payload);
    setPage(1);           // show newest at top
    await loadAll(1);
  }

  async function handleUpdate(payload) {
    await api.updateTransaction(editing.id, payload);
    setEditing(null);
    await loadAll();
  }

  async function handleDelete(t) {
    if (!confirm('Delete this transaction?')) return;
    await api.deleteTransaction(t.id);
    // stay on same page unless last row removed
    const nextTotal = total - 1;
    const maxPage = Math.max(Math.ceil(nextTotal / pageSize), 1);
    const nextPage = Math.min(page, maxPage);
    setPage(nextPage);
    await loadAll(nextPage);
  }

  const balance = (Number(summary.income || 0) - Number(summary.expense || 0)).toFixed(2);

  return (
    <div className="container py-4">
      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Dashboard</h2>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            Signed in as <strong>{user?.email || user?.username}</strong>
          </span>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <FiltersBar
            value={filters}
            onApply={(next) => { setFilters(next); setPage(1); }}
            onClear={(empty) => { setFilters(empty); setPage(1); }}
            fetchCategories={(params) => api.getCategories(params)}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="text-muted">Total Income</div>
              <div className="fs-3 fw-semibold text-success">
                ${Number(summary.income || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="text-muted">Total Expense</div>
              <div className="fs-3 fw-semibold text-danger">
                ${Number(summary.expense || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="text-muted">Balance</div>
              <div className="fs-3 fw-semibold">${balance}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>By Category</span>
              <div className="btn-group btn-group-sm" role="group" aria-label="Chart mode">
                <button
                  className={`btn ${chartMode === 'expense' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartMode('expense')}
                >
                  Expenses
                </button>
                <button
                  className={`btn ${chartMode === 'income' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartMode('income')}
                >
                  Income
                </button>
              </div>
            </div>
            <div className="card-body">
              <SpendingByCategoryPie
                data={chartMode === 'expense' ? summary.byExpenseCategory : summary.byIncomeCategory}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Monthly Income vs Expense</span>
              <div className="btn-group btn-group-sm">
                <button
                  className={`btn ${totalsMode === 'grouped' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setTotalsMode('grouped')}
                >
                  Grouped
                </button>
                <button
                  className={`btn ${totalsMode === 'stacked' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setTotalsMode('stacked')}
                >
                  Stacked
                </button>
              </div>
            </div>
            <div className="card-body">
              <MonthlyTotalsBar items={items} mode={totalsMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Form + Table */}
      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header">{editing ? 'Edit Transaction' : 'Add Transaction'}</div>
            <div className="card-body">
              <TransactionForm
                initial={editing}
                onSubmit={editing ? handleUpdate : handleCreate}
              />
              {editing && (
                <button
                  className="btn btn-outline-secondary mt-2"
                  onClick={() => setEditing(null)}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card h-100">
            <div className="card-header d-flex gap-2 justify-content-between align-items-center">
              <span>Transactions</span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => loadAll()}
                  disabled={loading}
                >
                  Refresh
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={exportCSV}
                  disabled={loading || total === 0}
                >
                  Export CSV
                </button>
              </div>
            </div>
            <div className="card-body">
              <TransactionsTable
                items={items}
                loading={loading}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
              <PaginationBar
                page={page}
                pageSize={pageSize}
                total={total}
                onChange={(p) => setPage(p)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
