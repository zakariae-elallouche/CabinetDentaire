import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { toast } from 'react-toastify'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useApiQuery, useApiMutation } from '../../hooks/useApi'
import AnimateIn from '../../components/AnimateIn'
import DonutLoader from '../../components/DonutLoader'

function ManageTeam() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', role: 'secretaire' })
  const [sending, setSending] = useState(false)
  const [newMemberPw, setNewMemberPw] = useState(null)

  const { data: members = [], isLoading } = useApiQuery('invitations', '/invitations')

  const addMutation = useApiMutation('post', '/invitations', {
    onSuccess: (res) => {
      setNewMemberPw(res.data)
      setForm({ nom: '', prenom: '', email: '', role: 'secretaire' })
      setShowForm(false)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Erreur'),
    invalidate: 'invitations',
  })

  const resetPwMutation = useApiMutation('put', null, {
    onSuccess: (res) => setNewMemberPw(res.data),
    onError: () => toast.error('Erreur'),
  })

  const deleteMutation = useApiMutation('delete', null, {
    onSuccess: () => toast.success('Membre supprimé'),
    onError: () => toast.error('Erreur'),
    invalidate: 'invitations',
  })

  const addMember = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await addMutation.mutateAsync(form)
    } catch { /* handled */ }
    setSending(false)
  }

  const resetPw = (id) => {
    resetPwMutation.mutate({ _config: { url: `/invitations/${id}/password` } })
  }

  const deleteMember = (id, name) => {
    if (!window.confirm(`Supprimer ${name} de l'équipe ?`)) return
    deleteMutation.mutate({ _config: { url: `/invitations/${id}` } })
  }

  if (isLoading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Gestion de l'équipe</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>Ajoutez des dentistes et secrétaires à votre clinique</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{
          padding: '10px 20px', background: '#4AB2BB', color: '#fff', border: 'none',
          borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {showForm ? 'Fermer' : '+ Ajouter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addMember} style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input type="text" value={form.prenom} onChange={e => setForm(f => ({...f, prenom: e.target.value}))} placeholder="Prénom" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nom</label>
              <input type="text" value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} placeholder="Nom" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="email@exemple.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Rôle</label>
              <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} style={inputStyle}>
                <option value="secretaire">Secrétaire</option>
                <option value="dentiste">Dentiste</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={sending} style={{
            padding: '10px 24px', background: '#4AB2BB', color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
            {sending ? 'Ajout...' : 'Ajouter le membre'}
          </button>
        </form>
      )}

      {/* Password modal */}
      {newMemberPw && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: '#1a201f55', backdropFilter: 'blur(4px)', zIndex: 50 }} onClick={() => setNewMemberPw(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(1)', zIndex: 51, width: '100%', maxWidth: '440px', padding: '0 16px', boxSizing: 'border-box' }}>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 20, color: 'var(--ink)', margin: 0 }}>
                  {newMemberPw.nom ? 'Membre ajouté' : 'Mot de passe réinitialisé'}
                </h2>
                <button onClick={() => setNewMemberPw(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18, padding: 0 }}>✕</button>
              </div>
              {newMemberPw.nom && (
                <p style={{ color: 'var(--ink)', fontSize: 14, margin: '0 0 16px' }}>
                  {newMemberPw.prenom} {newMemberPw.nom} ({newMemberPw.email})
                </p>
              )}
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 6px', fontWeight: 500 }}>Mot de passe</p>
                <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 24, fontWeight: 700, color: '#4AB2BB', margin: 0, letterSpacing: '0.05em' }}>{newMemberPw.password}</p>
              </div>
              <p style={{ color: 'var(--ink-3)', fontSize: 12, margin: 0 }}>Transmettez ce mot de passe au membre. Il pourra le changer après connexion.</p>
            </div>
          </div>
        </>
      )}

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <AnimateIn>
          {members.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Aucun membre dans l'équipe
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 500 : undefined }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 500 }}>Nom</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 500 }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 500 }}>Rôle</th>
                  <th style={{ textAlign: 'right', padding: '14px 20px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--ink)' }}>
                      {m.prenom} {m.nom}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--ink-3)' }}>{m.email}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14 }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12,
                        background: m.role === 'dentiste' ? '#e8f4f1' : '#f0edf7',
                        color: m.role === 'dentiste' ? '#57c8cb' : '#5a4a8a',
                      }}>
                        {m.role === 'dentiste' ? 'Dentiste' : 'Secrétaire'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button onClick={() => resetPw(m.id)} style={{
                          background: 'none', border: '1px solid var(--line)', borderRadius: 8,
                          padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: '#4AB2BB', fontFamily: 'inherit',
                        }}>
                          Réinitialiser
                        </button>
                        <button onClick={() => deleteMember(m.id, `${m.prenom} ${m.nom}`)} style={{
                          background: 'none', border: '1px solid var(--line)', borderRadius: 8,
                          padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: 'var(--rose)', fontFamily: 'inherit',
                        }}>
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

export default ManageTeam