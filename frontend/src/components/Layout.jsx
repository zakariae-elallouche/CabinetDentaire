import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import api from '../api'

function Layout({ children }) {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (user && !user.nom_complet) {
      api.get('/me').then(res => {
        const { nom, prenom } = res.data.profile
        updateUser({ nom, prenom, nom_complet: `${prenom} ${nom}` })
      }).catch(() => {})
    }
  }, [user?.id])

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => {
    if (!showUserMenu) return
    const h = (e) => { if (!e.target.closest('[data-user-menu]')) setShowUserMenu(false) }
    document.addEventListener('mousedown', h)
    document.addEventListener('touchstart', h)
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h) }
  }, [showUserMenu])

  const getNavLinks = () => {
    if (user?.role === 'PATIENT') return [
      { icon: 'home',    label: 'Accueil',       path: '/patient/dashboard' },
      { icon: 'cal',     label: 'Réserver',       path: '/patient/reserver' },
      { icon: 'list',    label: 'Mes RDV',        path: '/patient/rendez-vous' },
      { icon: 'visit',   label: 'Visites',        path: '/patient/visites' },
      { icon: 'pill',    label: 'Ordonnances',    path: '/patient/ordonnances' },
      { icon: 'receipt', label: 'Factures',       path: '/patient/factures' },
      { icon: 'user',    label: 'Profil',         path: '/patient/profil' },
    ]
    if (user?.role === 'SECRETAIRE') return [
      { icon: 'home',     label: 'Accueil',       path: '/secretaire/dashboard' },
      { icon: 'list',     label: 'RDV',           path: '/secretaire/rendez-vous' },
      { icon: 'receipt',  label: 'Paiements',     path: '/secretaire/paiements' },
      { icon: 'pill',     label: 'Médicaments',   path: '/secretaire/medicaments' },
      { icon: 'settings', label: 'Opérations',    path: '/secretaire/operations' },
      { icon: 'users',    label: 'Patients',      path: '/secretaire/patients' },
    ]
    if (user?.role === 'DENTISTE') return [
      { icon: 'home',  label: 'Accueil',  path: '/dentiste/dashboard' },
      { icon: 'cal',   label: 'Agenda',   path: '/dentiste/agenda' },
      { icon: 'users', label: 'Patients', path: '/dentiste/patients' },
    ]
    return []
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const displayName = user?.nom_complet || user?.email || ''
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const navLinks = getNavLinks()
  const currentLabel = navLinks.find(l => l.path === location.pathname)?.label || 'HZ Dentaire'

  const NavIcon = ({ type, size = 16 }) => {
    const icons = {
      home:     <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/></svg>,
      cal:      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
      list:     <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>,
      pill:     <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M8.5 6.5l7 7"/></svg>,
      receipt:  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>,
      user:     <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>,
      users:    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3a3 3 0 0 1 0 6M21 21v-2a4 4 0 0 0-3-3.87"/></svg>,
      visit:    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
      edit:     <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      settings: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    }
    return icons[type] || icons.home
  }

  /* ─── MOBILE LAYOUT ─── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

        {/* Mobile topbar */}
        <div style={{
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--surface)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <img src="/HZLogo.png" alt="HZ" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
          <span style={{
            fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 16,
            color: 'var(--ink)', flex: 1, minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {currentLabel}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {user?.role !== 'DENTISTE' && <NotificationBell />}
            <div style={{ position: 'relative' }} data-user-menu>
              <div
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9d6d1, #9ab3ac)',
                  display: 'grid', placeItems: 'center',
                  color: '#fff', fontWeight: 500, fontSize: 13, cursor: 'pointer',
                  flexShrink: 0,
                }}
                onClick={() => setShowUserMenu(v => !v)}
              >
                {initials}
              </div>
              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: '42px', right: 0,
                  minWidth: '190px',
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                  padding: '14px',
                  zIndex: 300,
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>{user?.role}</div>
                  {user?.role === 'PATIENT' && (
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/patient/profil') }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', textAlign: 'left', marginBottom: '8px' }}
                    >
                      Mon profil
                    </button>
                  )}
                  <button
                    onClick={() => { setShowUserMenu(false); handleLogout() }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', textAlign: 'left' }}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '20px 16px calc(80px + env(safe-area-inset-bottom, 16px))', overflowX: 'hidden' }}>
          {children}
        </div>

        {/* Bottom navigation */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}>
          {navLinks.slice(0, 5).map(link => {
            const isActive = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  flex: 1,
                  padding: '10px 4px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  color: isActive ? 'var(--accent)' : 'var(--ink-3)',
                  transition: 'color 0.15s',
                  minWidth: 0,
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6 }}>
                  <NavIcon type={link.icon} size={20} />
                </span>
                <span style={{
                  fontSize: 9.5, fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.01em', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: '100%', padding: '0 2px',
                }}>
                  {link.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  /* ─── DESKTOP LAYOUT ─── */
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: collapsed ? '64px 1fr' : '260px 1fr', background: 'var(--bg)' }}>

      {/* ─── Sidebar ─── */}
      <div style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
        padding: '22px 18px',
        position: 'sticky', top: 0,
        height: '100vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', transition: 'width 0.25s',
      }}>

        {collapsed ? (
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setCollapsed(false)}
              title="Développer"
              style={{ width: '36px', height: '36px', borderRadius: '9px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '22px', borderBottom: '1px solid var(--line)', marginBottom: '8px' }}>
            <img src="/HZLogo.png" alt="HZ" style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <b style={{ fontFamily: "'Fraunces', serif", fontWeight: '500', fontSize: '15px', display: 'block', color: 'var(--ink)' }}>HZ Dentaire</b>
              <small style={{ color: 'var(--ink-3)', fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cabinet Dentaire</small>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              title="Réduire"
              style={{ marginLeft: 'auto', width: '28px', height: '28px', borderRadius: '7px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink-3)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>
        )}

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {!collapsed && <div style={{ fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '14px 10px 6px' }}>Navigation</div>}
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <div
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '9px 10px', borderRadius: '9px',
                  color: isActive ? '#fff' : 'var(--ink-2)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  fontSize: '13.5px', cursor: 'pointer',
                  marginBottom: '3px', transition: 'all 0.15s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? link.label : ''}
              >
                <span style={{ opacity: isActive ? 1 : 0.75, flexShrink: 0 }}>
                  <NavIcon type={link.icon} />
                </span>
                {!collapsed && <span>{link.label}</span>}
              </div>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9d6d1, #9ab3ac)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '500', fontSize: '13px', flexShrink: 0 }}>
            {initials}
          </div>
          {!collapsed && <>
            <div style={{ lineHeight: '1.2', overflow: 'hidden' }}>
              <b style={{ fontSize: '13px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</b>
              <small style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{user?.role}</small>
            </div>
            <button onClick={handleLogout} style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--rose)', flexShrink: 0 }}>Quitter</button>
          </>}
        </div>
      </div>

      {/* ─── Main ─── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 5 }}>
          <span style={{ color: 'var(--ink-3)', fontSize: '12.5px' }}>
            HZ Dentaire &nbsp;/&nbsp; <b style={{ color: 'var(--ink)', fontWeight: '500' }}>{currentLabel}</b>
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user?.role !== 'DENTISTE' && <NotificationBell />}
            <span style={{ border: '1px solid var(--line)', background: 'var(--card)', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}/>
              {displayName}
            </span>
          </div>
        </div>
        <div style={{ padding: '36px 40px 80px', maxWidth: '1180px', width: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
