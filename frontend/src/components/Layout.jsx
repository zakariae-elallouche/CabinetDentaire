import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
import NotificationBell from './NotificationBell'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 56

function Layout({ children }) {
  const { user, logout, branding, tenantStatut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    h()
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
      { icon: 'home',    label: 'Accueil',     path: '/patient/dashboard' },
      { icon: 'cal',     label: 'Réserver',     path: '/patient/reserver' },
      { icon: 'list',    label: 'Mes RDV',      path: '/patient/rendez-vous' },
      { icon: 'visit',   label: 'Visites',      path: '/patient/visites' },
      { icon: 'pill',    label: 'Ordonnances',  path: '/patient/ordonnances' },
      { icon: 'receipt', label: 'Factures',     path: '/patient/factures' },
    ]
    if (user?.role === 'SECRETAIRE') return [
      { icon: 'home',    label: 'Accueil',      path: '/secretaire/dashboard' },
      { icon: 'list',    label: 'RDV',          path: '/secretaire/rendez-vous' },
      { icon: 'receipt', label: 'Paiements',    path: '/secretaire/paiements' },
      { icon: 'users',   label: 'Patients',     path: '/secretaire/patients' },
    ]
    if (user?.role === 'DENTISTE') return [
      { icon: 'home',  label: 'Accueil',    path: '/dentiste/dashboard' },
      { icon: 'cal',   label: 'Agenda',     path: '/dentiste/agenda' },
      { icon: 'users', label: 'Patients',   path: '/dentiste/patients' },
    ]
    if (user?.role === 'ADMIN_CLINIQUE') return [
      { icon: 'home',     label: 'Accueil',       path: '/admin/dashboard' },
      { icon: 'users',    label: 'Équipe',        path: '/admin/equipe' },
      { icon: 'receipt',  label: 'Facturation',   path: '/admin/facturation' },
      { icon: 'settings', label: 'Paramètres',    path: '/admin/parametres' },
      { icon: 'edit',     label: 'Opérations',    path: '/admin/catalogue-operations' },
      { icon: 'pill',     label: 'Médicaments',   path: '/admin/medicaments' },
    ]
    if (user?.role === 'SUPERADMIN') return [
      { icon: 'home',  label: 'Dashboard', path: '/superadmin/dashboard' },
      { icon: 'users', label: 'Cliniques', path: '/superadmin/tenants' },
    ]
    return []
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const displayName = user?.nom_complet || branding?.nom_clinique || ''
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const navLinks = getNavLinks()
  const clinicName = branding?.nom_clinique || 'HZ Dentaire'
  const currentLabel = navLinks.find(l => l.path === location.pathname)?.label || clinicName
  const logoUrl = branding?.logo_url
    ? (branding.logo_url.startsWith('http') ? branding.logo_url : `https://cabinetdentaire.onrender.com/storage/${branding.logo_url}`)
    : '/DentASpace-Logo.png'
  const isWide = !isMobile && window.innerWidth > 1200

  const NavIcon = ({ type, size = 18 }) => {
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
        <div style={{
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: '1px solid var(--line)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink)', padding: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, lineHeight: 1, flexShrink: 0,
            }}
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen
                ? <path d="M18 6 6 18M6 6l12 12"/>
                : <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>
              }
            </svg>
          </button>
          <img src={logoUrl} alt={clinicName} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
          <span style={{
            fontWeight: 500, fontSize: 16,
            color: 'var(--ink)', flex: 1, minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {currentLabel}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {user?.role !== 'DENTISTE' && <NotificationBell user={user} />}
            <div style={{ position: 'relative' }} data-user-menu>
              <div
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                    background: '#4AB2BB',
                  display: 'grid', placeItems: 'center',
                  color: '#fff', fontWeight: 500, fontSize: 13, cursor: 'pointer',
                  flexShrink: 0, transition: 'transform 0.15s',
                  boxShadow: '0 2px 8px #4AB2BB',
                }}
                onClick={() => setShowUserMenu(v => !v)}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {initials}
              </div>
              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: '42px', right: 0,
                  minWidth: '190px',
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  padding: '14px',
                  zIndex: 300,
                  animation: 'scaleIn 0.15s ease',
                  transformOrigin: 'top right',
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>{user?.role}</div>
                  {user?.role === 'PATIENT' && (
                    <MenuItem onClick={() => { setShowUserMenu(false); navigate('/patient/profil') }}>Mon profil</MenuItem>
                  )}
                  {(user?.role === 'SECRETAIRE' || user?.role === 'DENTISTE' || user?.role === 'ADMIN_CLINIQUE') && (
                    <MenuItem onClick={() => {
                      setShowUserMenu(false)
                      const paths = { SECRETAIRE: '/secretaire/compte', DENTISTE: '/dentiste/compte', ADMIN_CLINIQUE: '/admin/compte' }
                      navigate(paths[user.role])
                    }}>Mon Profil</MenuItem>
                  )}
                  <button
                    onClick={() => { setShowUserMenu(false); handleLogout() }}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '8px',
                      background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                      fontFamily: 'inherit', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ffe8e6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--rose-soft)'}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 16px 32px', overflowX: 'hidden' }}>
          <SubscriptionBanner statut={tenantStatut} userRole={user?.role} />
          {children}
        </div>

        {/* Mobile sidebar drawer */}
        {mobileMenuOpen && (
          <>
            <div
              style={{
                position: 'fixed', inset: 0, zIndex: 199,
                background: 'rgba(0,0,0,0.3)',
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
              zIndex: 200,
              background: 'linear-gradient(rgba(10,20,40,0.82), rgba(10,20,40,0.82)), url(/background-dentaspace.png) center/cover no-repeat',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideInLeft 0.2s ease',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <img src={logoUrl} alt={clinicName} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clinicName}</div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.6)', padding: 4, fontSize: 20, lineHeight: 1,
                  }}
                  aria-label="Fermer"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {navLinks.map(link => {
                  const isActive = location.pathname === link.path
                  return (
                    <div
                      key={link.path}
                      onClick={() => { setMobileMenuOpen(false); navigate(link.path) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 18px',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                        fontSize: 14, cursor: 'pointer',
                        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                        fontWeight: isActive ? 600 : 400,
                        borderRight: isActive ? '3px solid #4AB2BB' : '3px solid transparent',
                        transition: 'all 0.12s',
                        position: 'relative',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.color = '#fff'
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <span style={{ opacity: isActive ? 1 : 0.6, display: 'flex' }}>
                        <NavIcon type={link.icon} size={20} />
                      </span>
                      <span>{link.label}</span>
                    </div>
                  )
                })}
              </nav>
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#4AB2BB',
                    display: 'grid', placeItems: 'center',
                    color: '#fff', fontWeight: 500, fontSize: 12, flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div style={{ lineHeight: '1.15', overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{displayName}</div>
                    <small style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)' }}>Connecté</small>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    fontFamily: 'inherit', textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'var(--rose)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </>
        )}


      </div>
    )
  }

  /* ─── DESKTOP LAYOUT ─── */
  const sbw = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: `${sbw}px 1fr`,
      background: 'var(--bg)',
    }}>
      {/* ─── Sidebar ─── */}
      <div style={{
        background: 'linear-gradient(rgba(10,20,40,0.82), rgba(10,20,40,0.82)), url(/background-dentaspace.png) center/cover no-repeat',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: collapsed ? '18px 8px' : '22px 14px',
        position: 'sticky', top: 0,
        height: '100vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'padding 0.2s',
        zIndex: 20,
      }}>
        {/* Logo + Toggle */}
        {collapsed ? (
          <div style={{
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            <img src={logoUrl} alt={clinicName} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
            <button
              onClick={() => setCollapsed(false)}
              title="Développer"
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                transition: 'all 0.15s',
                fontSize: 13,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            paddingBottom: '18px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '8px',
          }}>
            <img src={logoUrl} alt={clinicName} style={{ width: 38, height: 38, objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clinicName}</div>
              <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cabinet Dentaire</small>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              title="Réduire"
              style={{
                width: 26, height: 26, borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                transition: 'all 0.15s',
                fontSize: 11,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav ref={navRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: collapsed ? 0 : 4 }}>
          {navLinks.map((link, idx) => {
            const isActive = location.pathname === link.path
            return (
              <div
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: collapsed ? '10px 0' : '8px 10px 8px 14px',
                  borderRadius: '6px',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: '13px', cursor: 'pointer',
                  marginBottom: '1px',
                  transition: 'all 0.12s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
                title={collapsed ? link.label : ''}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {isActive && !collapsed && (
                  <span style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 18, borderRadius: '0 3px 3px 0',
                    background: '#4AB2BB',
                  }} />
                )}
                <span style={{
                  flexShrink: 0,
                  opacity: isActive ? 1 : 0.6,
                  transition: 'opacity 0.12s',
                  display: 'flex',
                }}>
                  <NavIcon type={link.icon} size={collapsed ? 20 : 18} />
                </span>
                {!collapsed && (
                  <span style={{
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontWeight: isActive ? 500 : 400,
                  }}>
                    {link.label}
                  </span>
                )}
              </div>
            )
          })}
        </nav>

        {/* User section */}
        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: collapsed ? 10 : 12,
        }}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              style={{
                width: '100%', padding: '8px 0',
                display: 'flex', justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                borderRadius: 6, transition: 'all 0.12s',
                background: 'none', border: 'none', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          ) : (
            <div style={{ position: 'relative' }} data-user-menu>
              <div
                onClick={() => setShowUserMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', borderRadius: 8,
                  padding: '4px 6px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#4AB2BB',
                  display: 'grid', placeItems: 'center',
                  color: '#fff', fontWeight: 500, fontSize: 12, flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(87,200,203,0.25)',
                }}>
                  {initials}
                </div>
                <div style={{ lineHeight: '1.15', overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{displayName}</div>
                  <small style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)' }}>Connecté</small>
                </div>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    color: 'rgba(255,255,255,0.4)', flexShrink: 0,
                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s',
                  }}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>

              {showUserMenu && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  padding: 14,
                  zIndex: 300,
                  animation: 'scaleIn 0.15s ease',
                  transformOrigin: 'bottom left',
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>{user?.role}</div>
                  {user?.role === 'PATIENT' && (
                    <MenuItem onClick={() => { setShowUserMenu(false); navigate('/patient/profil') }}>Mon profil</MenuItem>
                  )}
                  {(user?.role === 'SECRETAIRE' || user?.role === 'DENTISTE' || user?.role === 'ADMIN_CLINIQUE') && (
                    <MenuItem onClick={() => {
                      setShowUserMenu(false)
                      const paths = { SECRETAIRE: '/secretaire/compte', DENTISTE: '/dentiste/compte', ADMIN_CLINIQUE: '/admin/compte' }
                      navigate(paths[user.role])
                    }}>Mon Profil</MenuItem>
                  )}
                  <button
                    onClick={() => { setShowUserMenu(false); handleLogout() }}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      fontFamily: 'inherit', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ffe8e6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--rose-soft)'}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{
          padding: '14px clamp(16px, 3vw, 32px)',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: '1px solid var(--line)',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 5,
        }}>
          <span style={{
            color: 'var(--ink-3)', fontSize: '12.5px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: "'Inter', sans-serif",
          }}>
            <span style={{ color: 'var(--ink-2)' }}>{clinicName}</span>
            <span style={{ color: 'var(--ink-3)', margin: '0 5px' }}>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{currentLabel}</span>
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {user?.role !== 'DENTISTE' && <NotificationBell user={user} />}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#4AB2BB',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontWeight: 500, fontSize: 12, flexShrink: 0,
              boxShadow: '0 2px 6px rgba(87,200,203,0.25)',
              cursor: 'default',
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Page Content — Fluid, no max-width constraint */}
        <div style={{
          padding: '32px clamp(20px, 3vw, 48px) 80px',
          width: '100%',
          maxWidth: isWide ? '1600px' : '100%',
          margin: isWide ? '0 auto' : 0,
        }}>
          <SubscriptionBanner statut={tenantStatut} userRole={user?.role} />
          {children}
        </div>
      </div>
    </div>
  )
}

function MenuItem({ onClick, children }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: '8px',
        background: hover ? 'var(--bg)' : 'transparent',
        color: 'var(--ink)', border: 'none',
        cursor: 'pointer', fontSize: '13px', fontWeight: 500,
        fontFamily: 'inherit', textAlign: 'left', marginBottom: '4px',
        transition: 'background 0.15s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  )
}

function SubscriptionBanner({ statut, userRole }) {
  if (!statut || statut === 'actif' || statut === 'essai' || userRole === 'SUPERADMIN') return null

  const messages = {
    expire: { title: 'Abonnement terminé', desc: 'Votre période d\'essai ou d\'abonnement est arrivée à expiration. Pour continuer à utiliser l\'application, veuillez souscrire à un abonnement.', color: '#ff4d4f', bg: '#fff2f0' },
    suspendu: { title: 'Clinique suspendue', desc: 'Votre clinique a été suspendue. Veuillez contacter le support pour plus d\'informations.', color: '#ff4d4f', bg: '#fff2f0' },
  }

  const msg = messages[statut] || { title: statut, desc: 'Statut inconnu', color: 'var(--ink-3)', bg: 'var(--bg)' }

  return (
    <div style={{
      background: msg.bg, border: `1px solid ${msg.color}`,
      borderRadius: 12, padding: '14px 18px', marginBottom: 20,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: msg.color, marginBottom: 4 }}>{msg.title}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{msg.desc}</div>
      </div>
    </div>
  )
}

export default Layout
