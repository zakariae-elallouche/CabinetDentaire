import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../api'
import { toast } from 'react-toastify'
import { useIsMobile } from '../../hooks/useIsMobile'
import AnimateIn from '../../components/AnimateIn'
import DonutLoader from '../../components/DonutLoader'

function GestionCatalogueOperations() {
  const isMobile = useIsMobile()
  const [ops, setOps] = useState([])
  const [form, setForm] = useState({ nom: '', description: '', cout: '' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/operations').then(r => setOps(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { nom: form.nom, description: form.description, cout: parseFloat(form.cout) || 0 }
      if (editing) {
        await api.put(`/operations/${editing}`, payload)
        toast.success('Opération modifiée')
      } else {
        await api.post('/operations', payload)
        toast.success('Opération ajoutée')
      }
      setForm({ nom: '', description: '', cout: '' })
      setEditing(null)
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
    setSaving(false)
  }

  const edit = (op) => {
    setForm({ nom: op.nom, description: op.description || '', cout: op.cout })
    setEditing(op.id)
    setShowForm(true)
  }

  const remove = async (id, nom) => {
    if (!window.confirm(`Supprimer l'opération "${nom}" ?`)) return
    try {
      await api.delete(`/operations/${id}`)
      toast.success('Opération supprimée')
      load()
    } catch { toast.error('Erreur') }
  }

  if (loading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Catalogue <em style={{ fontStyle: 'italic', color: '#4AB2BB' }}>opérations</em></h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>Gérez la liste des opérations dentaires et leurs tarifs</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setEditing(null); setForm({ nom: '', description: '', cout: '' }) }} style={{
          padding: '10px 20px', background: '#4AB2BB', color: '#fff', border: 'none',
          borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {showForm ? 'Fermer' : '+ Nouvelle opération'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Nom de l'opération</label>
              <input value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} placeholder="Ex: Détartrage" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Coût (MAD)</label>
              <input type="number" step="0.01" min="0" value={form.cout} onChange={e => setForm(f => ({...f, cout: e.target.value}))} placeholder="0.00" required style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description (optionnelle)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Description de l'opération..." rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" disabled={saving} style={btnStyle}>
            {saving ? 'Enregistrement...' : editing ? 'Modifier l\'opération' : 'Ajouter l\'opération'}
          </button>
        </form>
      )}

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <AnimateIn>
          {ops.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Aucune opération dans le catalogue
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 450 : undefined }}>
              <thead>
                <tr style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Nom</th>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '12px 24px', fontWeight: 500 }}>Coût</th>
                  <th style={{ textAlign: 'right', padding: '12px 24px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ops.map(op => (
                  <tr key={op.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 24px', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{op.nom}</td>
                    <td style={{ padding: '12px 24px', fontSize: 13, color: 'var(--ink-3)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.description || '—'}</td>
                    <td style={{ padding: '12px 24px', fontSize: 14, color: 'var(--ink)', textAlign: 'right', fontWeight: 500 }}>
                      {parseFloat(op.cout).toFixed(2)} <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400 }}>MAD</span>
                    </td>
                    <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button onClick={() => edit(op)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#4AB2BB', fontFamily: 'inherit' }}>
                          Modifier
                        </button>
                        <button onClick={() => remove(op.id, op.nom)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--rose)', fontFamily: 'inherit' }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          </AnimateIn>
      </div>
    </Layout>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10,
  fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--ink-3)', marginBottom: 6, fontWeight: 500,
}

const btnStyle = {
  padding: '10px 24px', background: '#4AB2BB', color: '#fff', border: 'none',
  borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
}

export default GestionCatalogueOperations