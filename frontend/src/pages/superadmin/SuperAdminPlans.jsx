import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../api'
import { toast } from 'react-toastify'
import AnimateIn from '../../components/AnimateIn'
import DonutLoader from '../../components/DonutLoader'


function SuperAdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/superadmin/plans').then(r => setPlans(r.data)).catch(() => toast.error('Erreur chargement plans'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce plan définitivement ?')) return
    try {
      await api.delete(`/superadmin/plans/${id}`)
      toast.success('Plan supprimé')
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.plan?.[0] || 'Erreur de suppression')
    }
  }

  if (loading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Plans d'abonnement</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>Gérer les offres disponibles pour les cliniques</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} style={{
          padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          + Nouveau plan
        </button>
      </div>

      {showForm && <PlanForm plan={editing} onClose={() => setShowForm(false)} onSaved={load} />}

      <AnimateIn>
      {plans.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Aucun plan pour le moment</div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {plans.map(plan => (
            <div key={plan.id} style={{
              background: 'var(--card)', borderRadius: 14, border: `1px solid ${plan.actif ? 'var(--line)' : '#fecaca'}`,
              padding: 24, position: 'relative', opacity: plan.actif ? 1 : 0.6,
            }}>
              {!plan.actif && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, background: '#fef2f2', color: '#991b1b', padding: '3px 8px', borderRadius: 6 }}>Inactif</span>}
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 20, color: 'var(--ink)', marginBottom: 2 }}>{plan.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12 }}>{plan.slug}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--accent)', marginBottom: 16 }}>
                {plan.prix_mensuel} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-3)' }}>MAD/mois</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>
                <strong>Dentistes :</strong> {plan.nb_dentistes_max ?? 'Illimité'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>
                <strong>Patients :</strong> {plan.nb_patients_max ?? 'Illimité'}
              </div>
              {plan.features?.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 3 }}>✓ {f}</div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => { setEditing(plan); setShowForm(true) }} style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)',
                  background: 'var(--surface)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: 'var(--ink)',
                }}>Modifier</button>
                <button onClick={() => handleDelete(plan.id)} style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid var(--rose)',
                  background: 'transparent', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: 'var(--rose)',
                }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
        )}
        </AnimateIn>
    </Layout>
  )
}

function PlanForm({ plan, onClose, onSaved }) {
  const [form, setForm] = useState({
    slug: plan?.slug || '',
    nom: plan?.nom || '',
    prix_mensuel: plan?.prix_mensuel || '',
    nb_dentistes_max: plan?.nb_dentistes_max ?? '',
    nb_patients_max: plan?.nb_patients_max ?? '',
    features: plan?.features?.join('\n') || '',
    actif: plan?.actif ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        prix_mensuel: Number(form.prix_mensuel),
        nb_dentistes_max: form.nb_dentistes_max === '' ? null : Number(form.nb_dentistes_max),
        nb_patients_max: form.nb_patients_max === '' ? null : Number(form.nb_patients_max),
        features: form.features.split('\n').filter(Boolean),
      }
      if (plan) {
        await api.put(`/superadmin/plans/${plan.id}`, payload)
        toast.success('Plan modifié')
      } else {
        await api.post('/superadmin/plans', payload)
        toast.success('Plan créé')
      }
      onSaved()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Erreur'
      toast.error(msg)
    }
    setSaving(false)
  }

  return (
    <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 24 }}>
      <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18, color: 'var(--ink)', margin: '0 0 16px' }}>
        {plan ? 'Modifier le plan' : 'Nouveau plan'}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Slug *</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>Nom *</label>
          <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>Prix mensuel (MAD) *</label>
          <input type="number" value={form.prix_mensuel} onChange={e => setForm(f => ({ ...f, prix_mensuel: e.target.value }))} style={inputStyle} required min={0} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Dentistes max</label>
            <input type="number" value={form.nb_dentistes_max} onChange={e => setForm(f => ({ ...f, nb_dentistes_max: e.target.value }))} style={inputStyle} placeholder="Illimité" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Patients max</label>
            <input type="number" value={form.nb_patients_max} onChange={e => setForm(f => ({ ...f, nb_patients_max: e.target.value }))} style={inputStyle} placeholder="Illimité" />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Fonctionnalités (une par ligne)</label>
          <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="plan-actif" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))} />
          <label htmlFor="plan-actif" style={{ fontSize: 13, color: 'var(--ink)' }}>Plan actif</label>
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button type="submit" disabled={saving} style={{
            padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Enregistrement...' : plan ? 'Enregistrer' : 'Créer le plan'}
          </button>
          <button type="button" onClick={onClose} style={{
            padding: '10px 24px', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--line)',
            borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>Annuler</button>
        </div>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8,
  fontSize: 13, background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--ink-3)', marginBottom: 4, fontWeight: 500,
}

export default SuperAdminPlans