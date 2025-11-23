import { useTheme } from '../context/ThemeContext.jsx';

export default function SettingsModal({ open, onClose }) {
  const { theme, toggle, setTheme } = useTheme();
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings</h3>
        </div>
        <div className="modal-body">
          <div className="setting-row">
            <div>Theme</div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <button className={`btn ${theme==='light'?'primary':''}`} onClick={()=>setTheme('light')}>Day</button>
              <button className={`btn ${theme==='dark'?'primary':''}`} onClick={()=>setTheme('dark')}>Night</button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}


