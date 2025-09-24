export default function PaginationBar({ page, pageSize, total, onChange }) {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  const canPrev = page > 1;
  const canNext = page < pages;

  // Build a compact page list: 1 … neighbors … last
  const nums = [];
  const push = (n) => nums.includes(n) || nums.push(n);
  push(1); push(pages);
  for (let n = page - 2; n <= page + 2; n++) if (n >= 1 && n <= pages) push(n);
  nums.sort((a,b) => a - b);

  const display = [];
  for (let i = 0; i < nums.length; i++) {
    display.push(nums[i]);
    if (i < nums.length - 1 && nums[i+1] !== nums[i] + 1) display.push('…');
  }

  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mt-2">
      <div className="text-muted small">
        {total ? <>Showing <strong>{start}-{end}</strong> of <strong>{total}</strong></> : 'No rows'}
      </div>
      <div className="btn-group btn-group-sm">
        <button className="btn btn-outline-secondary" disabled={!canPrev} onClick={()=>onChange(page-1)}>Prev</button>
        {display.map((n, i) =>
          n === '…' ? (
            <button key={'e'+i} className="btn btn-outline-secondary" disabled>…</button>
          ) : (
            <button key={n} className={`btn ${n===page ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={()=>onChange(n)}>{n}</button>
          )
        )}
        <button className="btn btn-outline-secondary" disabled={!canNext} onClick={()=>onChange(page+1)}>Next</button>
      </div>
    </div>
  );
}
