import { useEffect, useState } from 'react';

export default function CommandPalette({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (open && e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function parse(text) {
    // very simple nlp: "Title #category @doing due:2025-12-31"
    const title = text.replace(/#\S+/g, '').replace(/@\S+/g, '').replace(/due:\S+/g, '').trim();
    const mCat = text.match(/#(\S+)/);
    const mStat = text.match(/@(todo|doing|done)/);
    const mDue = text.match(/due:(\d{4}-\d{2}-\d{2})/);
    return {
      title: title || text.trim(),
      category: mCat ? mCat[1] : undefined,
      status: mStat ? mStat[1] : undefined,
      dueDate: mDue ? mDue[1] : undefined
    };
  }

  async function submit(e) {
    e.preventDefault();
    const payload = parse(text);
    if (!payload.title) return;
    await onCreate(payload);
    setText('');
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.3)', display:'grid', placeItems:'start center', paddingTop:120, zIndex:50}} onClick={()=>setOpen(false)}>
      <form onClick={(e)=>e.stopPropagation()} onSubmit={submit} style={{width:600, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
        <div style={{fontSize:12, color:'#6b7280', marginBottom:8}}>快速新增：輸入標題，支援 #分類、@todo|@doing|@done、due:YYYY-MM-DD</div>
        <input autoFocus value={text} onChange={(e)=>setText(e.target.value)} placeholder="例如：Prepare slides #work @doing due:2025-11-05" style={{width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8}} />
      </form>
    </div>
  );
}

