import { useState } from 'react'
import Layout from '../../components/Layout'
import { toast } from 'react-toastify'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useApiQuery, useApiMutation } from '../../hooks/useApi'
import AnimateIn from '../../components/AnimateIn'
import DonutLoader from '../../components/DonutLoader'

function GestionMedicaments() {
  const isMobile = useIsMobile()
  const [form, setForm] = useState({ nom: '', description: '', forme: '', dosage: '' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { data: meds = [], isLoading } = useApiQuery('medicaments', '/medicaments')

  const saveMutation = useApiMutation(null, null, {
    onSuccess: () => {
      setForm({ nom: '', description: '', forme: '', dosage: '' })
      setEditing(null)
      setShowForm(false)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Erreur'),
    invalidate: 'medicaments',
  })

  const deleteMutation = useApiMutation('delete', null, {
    onSuccess: () => toast.success('Médicament supprimé'),
    onError: () => toast.error('Erreur'),
    invalidate: 'medicaments',
  })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { nom: form.nom, description: form.description, forme: form.forme, dosage: form.dosage }
      if (editing) {
        await saveMutation.mutateAsync({ _config: { url: `/medicaments/${editing}`, method: 'put' }, ...payload })
        toast.success('Médicament modifié')
      } else {
        await saveMutation.mutateAsync({ _config: { url: '/medicaments', method: 'post' }, ...payload })
        toast.success('Médicament ajouté')
      }
    } catch { /* handled by onError */ }
    setSaving(false)
  }

  const edit = (m) => {
    setForm({ nom: m.nom, description: m.description || '', forme: m.forme || '', dosage: m.dosage || '' })
    setEditing(m.id)
    setShowForm(true)
  }

  const remove = async (id, nom) => {
    if (!window.confirm(`Supprimer le médicament "${nom}" ?`)) return
    deleteMutation.mutate({ _config: { url: `/medicaments/${id}` } })
  }

  if (isLoading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Gestion <em style={{ fontStyle: 'italic', color: '#4AB2BB' }}>médicaments</em></h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>Gérez la liste des médicaments disponibles pour les ordonnances</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setEditing(null); setForm({ nom: '', description: '', forme: '', dosage: '' }) }} style={{
          padding: '10px 20px', background: '#4AB2BB', color: '#fff', border: 'none',
          borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {showForm ? 'Fermer' : '+ Nouveau médicament'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Nom du médicament</label>
              <input value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} placeholder="Ex: Amoxicilline" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Dosage</label>
              <input value={form.dosage} onChange={e => setForm(f => ({...f, dosage: e.target.value}))} placeholder="Ex: 500 mg" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Forme</label>
              <select value={form.forme} onChange={e => setForm(f => ({...f, forme: e.target.value}))} style={inputStyle}>
                <option value="">Sélectionner...</option>
                <option value="comprimé">Comprimé</option>
                <option value="gélule">Gélule</option>
                <option value="sirop">Sirop</option>
                <option value="solution buvable">Solution buvable</option>
                <option value="pommade">Pommade</option>
                <option value="crème">Crème</option>
                <option value="gel">Gel</option>
                <option value="collyre">Collyre</option>
                <option value="injectable">Injectable</option>
                <option value="aérosol">Aérosol</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Description (optionnelle)</label>
              <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Indications, précautions..." style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={saving} style={btnStyle}>
            {saving ? 'Enregistrement...' : editing ? 'Modifier le médicament' : 'Ajouter le médicament'}
          </button>
        </form>
      )}

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <AnimateIn>
          {meds.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Aucun médicament dans la base
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 550 : undefined }}>
              <thead>
                <tr style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Nom</th>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Dosage</th>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Forme</th>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 500 }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '12px 24px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meds.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 24px', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{m.nom}</td>
                    <td style={{ padding: '12px 24px', fontSize: 13, color: 'var(--ink-3)' }}>{m.dosage || '—'}</td>
                    <td style={{ padding: '12px 24px', fontSize: 13 }}>
                      {m.forme ? (
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, background: '#f0fffd', color: '#57c8cb' }}>{m.forme}</span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px 24px', fontSize: 13, color: 'var(--ink-3)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description || '—'}</td>
                    <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button onClick={() => edit(m)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#4AB2BB', fontFamily: 'inherit' }}>
                          Modifier
                        </button>
                        <button onClick={() => remove(m.id, m.nom)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--rose)', fontFamily: 'inherit' }}>
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

export default GestionMedicaments