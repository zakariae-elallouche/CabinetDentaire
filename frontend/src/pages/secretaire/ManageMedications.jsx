import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import { confirmDialog } from '../../components/DialogProvider'
import EmptyState from '../../components/EmptyState'
import api from '../../api'
import { useIsMobile } from '../../hooks/useIsMobile'

const FORMES = ['Comprimé', 'Gélule', 'Sirop', 'Injectable', 'Crème']

const IcoEdit  = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoTrash = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IcoSave  = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
const IcoPlus  = () => <svg viewBox="0 0 14 14" width="14" height="14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>

const formeColor = (forme) => ({
  'Comprimé':   { bg: 'var(--accent-soft)',  color: 'var(--accent)' },
  'Gélule':     { bg: 'var(--amber-soft)',   color: '#8d6a2b' },
  'Sirop':      { bg: 'var(--success-soft)', color: 'var(--success)' },
  'Injectable': { bg: 'var(--rose-soft)',    color: 'var(--rose)' },
  'Crème':      { bg: 'var(--surface)',      color: 'var(--ink-2)' },
})[forme] || { bg: 'var(--surface)', color: 'var(--ink-2)' }

function ManageMedications() {
  const isMobile = useIsMobile()
  const [medications, setMedications] = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [formData, setFormData]       = useState({ nom: '', description: '', forme: 'Comprimé', dosage: '', prix_unitaire: '' })

  useEffect(() => { fetchMedications() }, [])

  const fetchMedications = async () => {
    try { const res = await api.get('/medicaments'); setMedications(res.data) }
    catch { console.error('Erreur chargement médicaments') }
    finally { setLoading(false) }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const openAdd = () => {
    setEditItem(null)
    setFormData({ nom: '', description: '', forme: 'Comprimé', dosage: '', prix_unitaire: '' })
    setModal(true)
  }

  const openEdit = (med) => {
    setEditItem(med)
    setFormData({ nom: med.nom, description: med.description, forme: med.forme, dosage: med.dosage, prix_unitaire: med.prix_unitaire })
    setModal(true)
  }

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/medicaments/${editItem.id}`, formData)
        setMedications(prev => prev.map(m => m.id === editItem.id ? { ...m, ...formData } : m))
        toast.success('Médicament modifié')
      } else {
        const res = await api.post('/medicaments', formData)
        setMedications(prev => [...prev, res.data])
        toast.success('Médicament ajouté')
      }
      setModal(false)
    } catch { toast.error("Erreur lors de l'enregistrement") }
  }

  const handleDelete = async (id) => {
    if (!await confirmDialog('Supprimer ce médicament ?', { danger: true, confirmLabel: 'Supprimer' })) return
    try {
      await api.delete(`/medicaments/${id}`)
      setMedications(prev => prev.filter(m => m.id !== id))
      toast.success('Médicament supprimé')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={s.pageTitle}>
              Gestion des <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>médicaments</em>
            </h1>
            <p style={s.pageSub}>Ajoutez et gérez le catalogue de médicaments</p>
          </div>
          <button style={s.btnPrimary} onClick={openAdd}>
            <IcoPlus /> Ajouter médicament
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-3)', padding: '2rem 0' }}>Chargement...</p>
        ) : medications.length === 0 ? (
          <>
            <EmptyState title="Aucun médicament" sub="Le catalogue est vide." />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-16px', marginBottom: '32px' }}>
              <button style={s.btnPrimary} onClick={openAdd}><IcoPlus /> Ajouter le premier</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {medications.map(med => {
              const fc = formeColor(med.forme)
              return (
                <div key={med.id} style={{ ...s.itemCard, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  {/* Pill icon */}
                  <div style={s.medIcon}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M8.5 6.5l7 7"/>
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={s.medName}>{med.nom}</b>
                    {med.description && <p style={s.medDesc}>{med.description}</p>}
                  </div>

                  {/* Metadata + Actions */}
                  {isMobile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', width: '100%', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                      <span style={{ ...s.chip, background: fc.bg, color: fc.color }}>{med.forme}</span>
                      {med.dosage && <span style={s.dosageBadge}>{med.dosage}</span>}
                      {med.prix_unitaire && <span style={s.prixBadge}>{parseFloat(med.prix_unitaire).toFixed(2)} MAD</span>}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                        <button style={s.btnEdit} onClick={() => openEdit(med)}><IcoEdit /> Modifier</button>
                        <button style={s.btnDelete} onClick={() => handleDelete(med.id)}><IcoTrash /></button>
                      </div>
                    </div>
                  ) : (
                  <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ ...s.chip, background: fc.bg, color: fc.color }}>{med.forme}</span>
                    {med.dosage && (
                      <span style={s.dosageBadge}>{med.dosage}</span>
                    )}
                    {med.prix_unitaire && (
                      <span style={s.prixBadge}>{parseFloat(med.prix_unitaire).toFixed(2)} MAD</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button style={s.btnEdit} onClick={() => openEdit(med)} title="Modifier">
                      <IcoEdit /> Modifier
                    </button>
                    <button style={s.btnDelete} onClick={() => handleDelete(med.id)} title="Supprimer">
                      <IcoTrash />
                    </button>
                  </div>
                  </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: '#1a201f55', backdropFilter: 'blur(4px)', zIndex: 50, opacity: modal ? 1 : 0, pointerEvents: modal ? 'auto' : 'none', transition: 'opacity 0.2s' }}
        onClick={() => setModal(false)}
      />

      {/* Modal */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: modal ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0.97)', opacity: modal ? 1 : 0, pointerEvents: modal ? 'auto' : 'none', transition: 'all 0.2s cubic-bezier(.3,.7,.2,1)', zIndex: 51, width: '100%', maxWidth: '520px', padding: '0 16px', boxSizing: 'border-box' }}>
        <div style={s.modal}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={s.modalTitle}>{editItem ? 'Modifier médicament' : 'Nouveau médicament'}</h2>
            <button onClick={() => setModal(false)} style={s.btnClose}>✕</button>
          </div>

          <div style={{ ...s.formRow, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <div style={s.formGroup}>
              <label style={s.label}>Nom</label>
              <input style={s.input} name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom du médicament" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Forme</label>
              <select style={s.input} name="forme" value={formData.forme} onChange={handleChange}>
                {FORMES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div style={{ ...s.formRow, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <div style={s.formGroup}>
              <label style={s.label}>Dosage</label>
              <input style={s.input} name="dosage" value={formData.dosage} onChange={handleChange} placeholder="Ex: 500mg" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Prix unitaire (MAD)</label>
              <input style={s.input} type="number" name="prix_unitaire" value={formData.prix_unitaire} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Description courte..." />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button style={s.btnOutline} onClick={() => setModal(false)}>Annuler</button>
            <button style={s.btnPrimary} onClick={handleSave}>
              <IcoSave /> Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const s = {
  pageTitle: { fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.1 },
  pageSub:   { color: 'var(--ink-2)', fontSize: '14px', margin: 0 },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '500', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' },
  emptyIcon: { width: '64px', height: '64px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', marginBottom: '16px' },
  itemCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', transition: 'border-color 0.15s' },
  medIcon: { width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 },
  medName: { fontSize: '14.5px', fontWeight: '500', color: 'var(--ink)', fontFamily: "'Fraunces', serif", display: 'block', marginBottom: '2px' },
  medDesc: { fontSize: '12.5px', color: 'var(--ink-3)', margin: 0 },
  chip: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '500' },
  dosageBadge: { fontFamily: '"Geist Mono", monospace', fontSize: '12px', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px', background: 'var(--surface)', border: '1px solid var(--line)' },
  prixBadge: { fontFamily: '"Geist Mono", monospace', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' },
  btnEdit:   { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 11px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  btnDelete: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none', cursor: 'pointer' },
  modal: { background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' },
  modalTitle: { fontFamily: "'Fraunces', serif", fontWeight: '400', fontSize: '22px', letterSpacing: '-0.01em', color: 'var(--ink)', margin: 0 },
  btnClose: { width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', background: 'var(--card)', cursor: 'pointer', fontSize: '14px', color: 'var(--ink-2)' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: 'var(--surface)', boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--ink)' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13.5px', outline: 'none', background: 'var(--surface)', boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--ink)', resize: 'vertical' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', padding: '9px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '500', background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit' },
}

export default ManageMedications
