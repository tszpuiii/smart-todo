export default function ConfirmDialog({ open, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-body">
          <div style={{fontSize:16}}>{message}</div>
        </div>
        <div className="modal-footer" style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <button className="btn" onClick={onCancel}>{cancelText}</button>
          <button className="btn danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}


