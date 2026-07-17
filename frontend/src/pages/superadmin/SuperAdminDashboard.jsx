import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../../components/Layout'
import AnimateIn from '../../components/AnimateIn'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useApiQuery } from '../../hooks/useApi'


const DONUT_COLORS = ['#16a34a', '#eab308', '#e11d48']

function CustomDot({ cx, cy, stroke }) {
  return <circle cx={cx} cy={cy} r={4} fill="#fff" stroke={stroke} strokeWidth={2} />
}

function SuperAdminDashboard() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { data: statsData } = useApiQuery('superadmin-stats', '/superadmin/stats')
  const { data: monthlyData } = useApiQuery('superadmin-monthly', '/superadmin/stats/monthly')

  const data = statsData
  const monthly = monthlyData?.months || []

  if (!data) return <Layout><div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}><DonutLoader /></div></Layout>

  const donutData = [
    { name: 'Actives', value: data.tenants.actifs },
    { name: 'Essai', value: data.tenants.essai },
    { name: 'Suspendues', value: data.tenants.suspendus },
  ].filter(d => d.value > 0)

  return (
    <Layout>
      <AnimateIn>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 26, color: 'var(--ink)', margin: '0 0 4px' }}>Super Admin</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>Pilotage de la plateforme SaaS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard title="Total cliniques" value={data.tenants.total} />
        <StatCard title="Actives" value={data.tenants.actifs} color="#16a34a" />
        <StatCard title="En essai" value={data.tenants.essai} color="#eab308" />
        <StatCard title="Suspendues" value={data.tenants.suspendus} color="#e11d48" />
        <StatCard title="MRR" value={`${data.mrr} MAD`} />
        <StatCard title="Nouveaux (30j)" value={data.new_signups} />
        <StatCard title="Churn (mois)" value={data.churn} color="#e11d48" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: isMobile ? 16 : 24 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: 'var(--ink)', margin: '0 0 16px' }}>Répartition des cliniques</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)', border: '1px solid var(--line)',
                    borderRadius: 8, fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value, name) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {donutData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: DONUT_COLORS[i] }} />
                  {d.name}: <strong style={{ color: 'var(--ink)' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: isMobile ? 16 : 24 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: 'var(--ink)', margin: '0 0 16px' }}>Évolution mensuelle</h3>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--ink-3)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                <YAxis yAxisId="signups" tick={{ fontSize: 12, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="mrr" orientation="right" tick={{ fontSize: 12, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)', border: '1px solid var(--line)',
                    borderRadius: 8, fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Line yAxisId="signups" type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} dot={<CustomDot stroke="#6366f1" />} name="Nouvelles cliniques" />
                <Line yAxisId="mrr" type="monotone" dataKey="mrr" stroke="#16a34a" strokeWidth={2} dot={<CustomDot stroke="#16a34a" />} name="MRR (MAD)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Aucune donnée mensuelle</div>
          )}
        </div>
      </div>

      {data.expiring_trials.length > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 18, color: 'var(--ink)', margin: '0 0 16px' }}>
            ⏳ Trials expirant dans 7 jours ({data.expiring_trials.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.expiring_trials.map(t => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: 'var(--surface)', borderRadius: 10, fontSize: 14,
              }}>
                <div>
                  <strong style={{ color: 'var(--ink)' }}>{t.nom_clinique}</strong>
                  <span style={{ color: 'var(--ink-3)', marginLeft: 12 }}>{t.slug}.dentapp.ma</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                    Expire le {new Date(t.trial_ends_at).toLocaleDateString('fr-FR')}
                  </span>
                  <button onClick={() => navigate(`/superadmin/tenants/${t.id}`)} style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)',
                    background: 'var(--card)', cursor: 'pointer', fontSize: 12,
                    fontFamily: 'inherit', color: 'var(--accent)',
                  }}>
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </AnimateIn>
    </Layout>
  )
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)', padding: '18px 22px' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: color || 'var(--ink)' }}>{value}</div>
    </div>
  )
}

export default SuperAdminDashboard

import DonutLoader from '../../components/DonutLoader'