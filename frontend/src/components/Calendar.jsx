import { useMemo } from 'react';

function startOfDay(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function Calendar({ tasks = [], monthDate, onMonthChange, selectedDate, onSelectDate }) {
  const month = monthDate || new Date();
  const year = month.getFullYear();
  const monthIdx = month.getMonth();

  const firstOfMonth = new Date(year, monthIdx, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0-6
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr = [];
    // previous month padding
    for (let i = 0; i < firstWeekday; i++) {
      arr.push({ date: null, tasks: [] });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIdx, d);
      const dayTasks = tasks.filter(t => t.dueDate && startOfDay(t.dueDate).getTime() === startOfDay(date).getTime());
      arr.push({ date, tasks: dayTasks });
    }
    // pad to 6 weeks grid
    while (arr.length % 7 !== 0 || arr.length < 42) arr.push({ date: null, tasks: [] });
    return arr;
  }, [tasks, year, monthIdx, daysInMonth, firstWeekday]);

  function goto(offset) {
    const next = new Date(year, monthIdx + offset, 1);
    onMonthChange?.(next);
  }

  return (
    <div className="calendar">
      <div className="cal-header">
        <button className="btn ghost-btn" onClick={() => goto(-1)}>←</button>
        <div className="cal-title">{year} / {String(monthIdx + 1).padStart(2,'0')}</div>
        <button className="btn ghost-btn" onClick={() => goto(1)}>→</button>
        <div className="spacer" />
        <button className="btn" onClick={() => onSelectDate?.(new Date())}>Today</button>
      </div>
      <div className="cal-weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => <div key={w} className="wk">{w}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((c, i) => (
          <div key={i} className={`cal-cell ${c.date ? '' : 'empty'} ${selectedDate && c.date && startOfDay(selectedDate).getTime() === startOfDay(c.date).getTime() ? 'selected' : ''}`}
               onClick={() => c.date && onSelectDate?.(c.date)}
          >
            <div className="cal-cell-date">{c.date ? c.date.getDate() : ''}</div>
            <div className="cal-cell-tasks">
              {c.tasks.slice(0, 3).map(t => (
                <div key={t._id} className="cal-pill">{t.title}</div>
              ))}
              {c.tasks.length > 3 && <div className="more">+{c.tasks.length - 3} more</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


