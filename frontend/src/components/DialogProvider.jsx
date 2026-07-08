import { useState } from 'react'

let _setDialog = null

export function confirmDialog(message, {
  confirmLabel = 'Confirmer',
  cancelLabel  = 'Annuler',
  danger       = false,
} = {}) {
  return new Promise((resolve) => {
    _setDialog({ type: 'confirm', message, confirmLabel, cancelLabel, danger, resolve })
  })
}

export function promptDialog(message, {
  placeholder  = '',
  defaultValue = '',
  confirmLabel = 'Valider',
  cancelLabel  = 'Annuler',
} = {}) {
  return new Promise((resolve) => {
    _setDialog({ type: 'prompt', message, placeholder, defaultValue, confirmLabel, cancelLabel, resolve })
  })
}

export default function DialogProvider() {
  const [dialog, setDialog] = useState(null)
  const [inputValue, setInputValue] = useState('')

  _setDialog = (d) => {
    setInputValue(d?.defaultValue || '')
    setDialog(d)
  }

  const close = (result) => {
    dialog?.resolve(result)
    setDialog(null)
  }

  if (!dialog) return null

  const isConfirm = dialog.type === 'confirm'

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,32,26,0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
        onClick={() => close(isConfirm ? false : null)}
      />

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        background: 'var(--bg)',
        borderRadius: '16px',
        padding: '28px 28px 24px',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        border: '1px solid var(--line)',
      }}>

        {/* Icon */}
        <div style={{
          width: '42px', height: '42px',
          borderRadius: '12px',
          background: dialog.danger ? 'var(--rose-soft)' : 'var(--accent-soft)',
          display: 'grid', placeItems: 'center',
          marginBottom: '16px',
          fontSize: '18px',
        }}>
          {dialog.danger ? '⚠️' : isConfirm ? '❓' : '✏️'}
        </div>

        <p style={{
          fontSize: '14.5px',
          color: 'var(--ink)',
          lineHeight: '1.6',
          marginBottom: !isConfirm ? '14px' : '24px',
          fontWeight: '500',
        }}>
          {dialog.message}
        </p>

        {!isConfirm && (
          <input
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={dialog.placeholder}
            onKeyDown={e => {
              if (e.key === 'Enter') close(inputValue || null)
              if (e.key === 'Escape') close(null)
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--line)',
              borderRadius: '10px',
              fontSize: '14px',
              background: 'var(--card)',
              color: 'var(--ink)',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '20px',
              fontFamily: 'inherit',
            }}
          />
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => close(isConfirm ? false : null)}
            style={{
              padding: '9px 18px', borderRadius: '9px',
              border: '1px solid var(--line-strong)',
              background: 'transparent',
              color: 'var(--ink-2)', fontSize: '13.5px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {dialog.cancelLabel}
          </button>
          <button
            onClick={() => close(isConfirm ? true : (inputValue || null))}
            style={{
              padding: '9px 18px', borderRadius: '9px',
              border: 'none',
              background: dialog.danger ? 'var(--rose)' : '#4AB2BB',
              color: '#fff', fontSize: '13.5px',
              fontWeight: '500', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {dialog.confirmLabel}
          </button>
        </div>

      </div>
    </>
  )
}
