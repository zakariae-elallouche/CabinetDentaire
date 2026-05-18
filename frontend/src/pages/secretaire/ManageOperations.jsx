import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

const IcoEdit = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoSave = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
const IcoX    = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

function ManageOperations() {
  const isMobile = useIsMobile()
  const [operations, setOperations] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editId, setEditId]         = useState(null)
  const [editCout, setEditCout]     = useState('')

  useEffect(() => {
    api.get('/operations')
      .then(res => setOperations(res.data))
      .catch(() => console.error('Erreur chargement opérations'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (id) => {
    if (!editCout) { toast.warning('Entrez un tarif'); return }
    try {
      await api.put(`/operations/${id}`, { cout: editCout })
      setOperations(prev => prev.map(op => op.id === id ? { ...op, cout: editCout } : op))
      setEditId(null)
      setEditCout('')
      toast.success('Tarif mis à jour')
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.pageTitle}>
            Catalogue des <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>opérations</em>
          </h1>
          <p style={s.pageSub}>Gérez les tarifs des opérations dentaires</p>
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-3)', padding: '2rem 0' }}>Chargement...</p>
        ) : operations.length === 0 ? (
          <EmptyState title="Aucune opération" sub="Le catalogue est vide." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {operations.map(op => {
              const editing = editId === op.id
              return (
                <div key={op.id} style={{ ...s.itemCard, ...(editing ? s.itemCardEditing : {}), flexWrap: isMobile ? 'wrap' : 'nowrap' }}>

                  {/* Icon */}
                  <div style={s.opIcon}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={s.opName}>{op.nom}</b>
                    {op.description && <p style={s.opDesc}>{op.description}</p>}
                  </div>

                  {/* Cost + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: isMobile ? 0 : 0, ...(isMobile ? { width: '100%', paddingTop: '8px', borderTop: '1px solid var(--line)', justifyContent: 'space-between' } : {}) }}>
                    {editing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          style={s.editInput}
                          type="number"
                          value={editCout}
                          onChange={e => setEditCout(e.target.value)}
                          placeholder="Tarif"
                          autoFocus
                        />
                        <span style={{ fontSize: '12.5px', color: 'var(--ink-3)', fontFamily: '"Geist Mono", monospace' }}>MAD</span>
                      </div>
                    ) : (
                      <span style={s.costBadge}>
                        {parseFloat(op.cout || 0).toFixed(2)} MAD
                      </span>
                    )}

                    {editing ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={s.btnSave} onClick={() => handleSave(op.id)}>
                          <IcoSave /> Enregistrer
                        </button>
                        <button style={s.btnCancel} onClick={() => { setEditId(null); setEditCout('') }}>
                          <IcoX />
                        </button>
                      </div>
                    ) : (
                      <button style={s.btnEdit} onClick={() => { setEditId(op.id); setEditCout(op.cout) }}>
                        <IcoEdit /> Modifier tarif
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  pageTitle: { fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.1 },
  pageSub:   { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' },
  emptyIcon: { width: '64px', height: '64px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', marginBottom: '16px' },
  itemCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', transition: 'border-color 0.15s' },
  itemCardEditing: { borderColor: 'var(--accent)' },
  opIcon: { width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 },
  opName: { fontSize: '14.5px', fontWeight: '500', color: 'var(--ink)', fontFamily: "'Fraunces', serif", display: 'block', marginBottom: '2px' },
  opDesc: { fontSize: '12.5px', color: 'var(--ink-3)', margin: 0 },
  costBadge: { fontFamily: '"Geist Mono", monospace', fontSize: '14px', fontWeight: '600', color: 'var(--ink)', padding: '5px 12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--line)' },
  editInput: { width: '110px', padding: '8px 10px', border: '1px solid var(--accent)', borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: 'var(--surface)', fontFamily: '"Geist Mono", monospace', color: 'var(--ink)', boxSizing: 'border-box' },
  btnEdit:   { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500', background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  btnSave:   { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  btnCancel: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-3)', cursor: 'pointer' },
}

export default ManageOperations
