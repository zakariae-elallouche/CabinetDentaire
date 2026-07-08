import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api'
import AnimateIn from '../../components/AnimateIn'
import DonutLoader from '../../components/DonutLoader'


function SuperAdminTenants() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ statut: '', search: '' })
  const [page, setPage] = useState(1)

  const load = (p = page) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, ...filters })
    Object.keys(filters).forEach(k => { if (!filters[k]) params.delete(k) })
    api.get(`/superadmin/tenants?${params}`).then(r => {
      setTenants(r.data.data)
      setMeta({ ...r.data, data: undefined })
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const search = () => { setPage(1); load(1) }

  if (loading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Cliniques</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>{meta?.total || 0} cliniques inscrites</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Rechercher..." style={inputStyle} onKeyDown={e => e.key === 'Enter' && search()} />
        <select value={filters.statut} onChange={e => setFilters(f => ({ ...f, statut: e.target.value }))} style={{ ...inputStyle, width: 150 }}>
          <option value="">Tous les statuts</option>
          <option value="essai">Essai</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
          <option value="suspendu">Suspendu</option>
        </select>
        <button onClick={search} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500 }}>
          Filtrer
        </button>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <AnimateIn>
          {tenants.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Aucune clinique trouvée</div>
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontWeight: 500 }}>Clinique</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontWeight: 500 }}>Sous-domaine</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontWeight: 500 }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontWeight: 500 }}>Créée le</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 18px', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{t.nom_clinique}</td>
                  <td style={{ padding: '12px 18px', fontSize: 13, color: 'var(--ink-3)' }}>{t.slug}.dentapp.ma</td>
                  <td style={{ padding: '12px 18px', fontSize: 13 }}><StatusBadge statut={t.statut} /></td>
                  <td style={{ padding: '12px 18px', fontSize: 13, color: 'var(--ink-3)' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                    <button onClick={() => navigate(`/superadmin/tenants/${t.id}`)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: 'var(--accent)' }}>
                      Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          </AnimateIn>
      </div>

      {meta && meta.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 34, height: 34, borderRadius: 8, border: '1px solid var(--line)',
              background: p === page ? 'var(--accent)' : 'var(--card)',
              color: p === page ? '#fff' : 'var(--ink)',
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </Layout>
  )
}

function StatusBadge({ statut }) {
  const m = { essai: { label: 'Essai', color: '#eab308' }, actif: { label: 'Actif', color: 'var(--success)' }, expire: { label: 'Abonnement terminé', color: 'var(--ink-3)' }, suspendu: { label: 'Suspendu', color: 'var(--rose)' } }
  const s = m[statut] || { label: statut, color: 'var(--ink-3)' }
  return <span style={{ color: s.color, fontWeight: 500 }}>{s.label}</span>
}

const inputStyle = {
  padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13,
  background: 'var(--surface)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 200,
}

export default SuperAdminTenants