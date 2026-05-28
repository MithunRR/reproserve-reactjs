import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Users, Briefcase, Home, ShieldCheck, FileText, Building,
  CalendarDays, Star, TrendingUp, LogOut, MessageSquare, Mail, Phone,
  Check, Trash2, X, MapPin, BadgeCheck, FileBadge, UserCheck, Clock
} from 'lucide-react';
import {
  fetchAdminStatsStart, logout,
  fetchContactMessagesStart,
  updateContactStatusStart,
  deleteContactMessageStart,
  fetchPendingApprovalsStart,
  setApprovalStart
} from '../Store/Features/Authentication/authslice';
import { currentUserStorage } from '../utils/localStorage';

// Rendered by ProfilePage when currentUser.role === 'admin'. Pulls counts +
// recent activity from /api/admin/stats and renders a compact dashboard.
export function AdminDashboard({ navigate, currentUser, setCurrentUser }) {
  const dispatch = useDispatch();
  const {
    adminStats, adminStatsLoading, adminStatsError,
    contactMessages, contactMessagesLoading,
    pendingProviders, pendingRealtors, pendingApprovalsLoading,
    pendingApprovalsError, setApprovalLoadingId
  } = useSelector((s) => s.AuthReducer);
  const [openMessage, setOpenMessage] = useState(null); // {id, name, ...} | null
  const [openPending, setOpenPending] = useState(null); // user record | null

  useEffect(() => {
    dispatch(fetchAdminStatsStart());
    dispatch(fetchContactMessagesStart());
    dispatch(fetchPendingApprovalsStart());
  }, [dispatch]);

  const decide = (user, status) => {
    const label = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${user.firstName || ''} ${user.lastName || ''}?`)) return;
    dispatch(setApprovalStart({ id: user.id, status }));
    if (openPending?.id === user.id) setOpenPending(null);
  };

  // Mark as read when an unread message is opened.
  useEffect(() => {
    if (openMessage && openMessage.status === 'new') {
      dispatch(updateContactStatusStart({ id: openMessage.id, status: 'read' }));
    }
  }, [openMessage, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    currentUserStorage.clear?.();
    try { localStorage.removeItem('currentUser'); } catch (_) {}
    dispatch(logout());
    if (setCurrentUser) setCurrentUser(null);
    navigate('/');
  };

  const c = adminStats?.counts || {};
  const r = adminStats?.recent || {};
  const last24h = adminStats?.last24h || {};

  return (
    <div
      className="px-4 min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse at top right, #0089e1 0%, transparent 50%),
          radial-gradient(ellipse at top left, #004571 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, #004471 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, #001624 0%, transparent 50%),
          linear-gradient(225deg, #004571, #001624)
        `,
        paddingTop: '80px',
        paddingBottom: '64px',
        marginTop: '-65px'
      }}>

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl text-white drop-shadow-lg mb-1">Admin Dashboard</h1>
            <p className="text-white drop-shadow-md text-sm">
              Welcome back, <span className="font-semibold">{currentUser?.name || 'Admin'}</span> ·
              {' '}<span className="text-white/80">{currentUser?.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold flex items-center gap-2 self-start md:self-end">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>

        {adminStatsLoading && !adminStats &&
          <Panel><p className="text-white drop-shadow-md">Loading dashboard…</p></Panel>
        }
        {adminStatsError &&
          <Panel><p className="text-red-300 drop-shadow-md">Failed to load stats: {String(adminStatsError)}</p></Panel>
        }

        {adminStats &&
          <>
            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Kpi icon={Users}      label="Users"             value={c.users     ?? 0} accent="#0089e1" />
              <Kpi icon={Briefcase}  label="Service Providers" value={c.providers ?? 0} accent="#0089e1" />
              <Kpi icon={Home}       label="Realtors"          value={c.realtors  ?? 0} accent="#0089e1" />
              <Kpi icon={ShieldCheck} label="Admins"           value={c.admins    ?? 0} accent="#ffd200" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Kpi icon={FileText}    label="Quote Requests"    value={c.quotes     ?? 0} accent="#0089e1" />
              <Kpi icon={Building}    label="Property Listings" value={c.listings   ?? 0} accent="#0089e1" />
              <Kpi icon={CalendarDays} label="Open Houses"      value={c.openHouses ?? 0} accent="#0089e1" />
              <Kpi icon={MessageSquare} label="Messages"
                value={`${c.messages ?? 0}${c.unreadMessages ? ` · ${c.unreadMessages} new` : ''}`}
                accent={c.unreadMessages ? '#ffd200' : '#0089e1'} />
            </div>

            {/* Last 24h */}
            <Panel className="mb-8">
              <h2 className="text-lg text-white drop-shadow-lg mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Last 24 hours
              </h2>
              <div className="grid grid-cols-2 gap-4 text-white">
                <Stat label="New signups"  value={last24h.signups ?? 0} />
                <Stat label="New quote requests" value={last24h.quotes ?? 0} />
              </div>
            </Panel>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel>
                <h2 className="text-lg text-white drop-shadow-lg mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" /> Recent Signups
                </h2>
                <List
                  empty="No signups yet."
                  items={(r.signups || []).map((u) => ({
                    key: u.id,
                    title: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                    subtitle: u.email,
                    badge: prettyRole(u.role),
                    meta: fmt(u.createdAt)
                  }))} />
              </Panel>

              <Panel>
                <h2 className="text-lg text-white drop-shadow-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Recent Quote Requests
                </h2>
                <List
                  empty="No quote requests yet."
                  items={(r.quotes || []).map((q) => {
                    const requester = q.requester ? `${q.requester.firstName || ''} ${q.requester.lastName || ''}`.trim() || q.requester.email : 'Someone';
                    const provider  = q.provider?.businessName
                      || (q.provider ? `${q.provider.firstName || ''} ${q.provider.lastName || ''}`.trim() : '—');
                    return {
                      key: q.id,
                      title: q.category || 'Quote request',
                      subtitle: `${requester} → ${provider}`,
                      badge: q.status,
                      meta: fmt(q.createdAt)
                    };
                  })} />
              </Panel>

              <Panel className="lg:col-span-2">
                <h2 className="text-lg text-white drop-shadow-lg mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5" /> Recent Property Listings
                </h2>
                <List
                  empty="No property listings yet."
                  items={(r.listings || []).map((l) => ({
                    key: l.id,
                    title: l.title || l.address,
                    subtitle: l.user ? `Posted by ${l.user.firstName || ''} ${l.user.lastName || ''}`.trim() : '',
                    badge: l.status,
                    meta: fmt(l.createdAt)
                  }))} />
              </Panel>

              {/* Pending Service Providers — awaiting admin approval */}
              <Panel className="lg:col-span-2">
                <PendingHeader
                  icon={Briefcase}
                  title="Pending Service Providers"
                  count={pendingProviders?.length || 0}
                  loading={pendingApprovalsLoading}
                  onRefresh={() => dispatch(fetchPendingApprovalsStart())}
                />
                <PendingError error={pendingApprovalsError} />
                <PendingList
                  rows={pendingProviders}
                  emptyText="No service providers awaiting approval."
                  onOpen={setOpenPending}
                  onDecide={decide}
                  setApprovalLoadingId={setApprovalLoadingId}
                />
              </Panel>

              {/* Pending Realtors — awaiting admin approval */}
              <Panel className="lg:col-span-2">
                <PendingHeader
                  icon={Home}
                  title="Pending Realtors"
                  count={pendingRealtors?.length || 0}
                  loading={pendingApprovalsLoading}
                  onRefresh={() => dispatch(fetchPendingApprovalsStart())}
                />
                <PendingError error={pendingApprovalsError} />
                <PendingList
                  rows={pendingRealtors}
                  emptyText="No realtors awaiting approval."
                  onOpen={setOpenPending}
                  onDecide={decide}
                  setApprovalLoadingId={setApprovalLoadingId}
                />
              </Panel>

              {/* Contact Messages — full table with row actions, fed by
                  /api/contact (separate from the /admin/stats summary). */}
              <Panel className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                  <h2 className="text-lg text-white drop-shadow-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> Contact Messages
                    {Array.isArray(contactMessages) &&
                      <span className="text-sm text-white/80">({contactMessages.length})</span>
                    }
                  </h2>
                  <button
                    onClick={() => {
                      dispatch(fetchContactMessagesStart());
                      dispatch(fetchAdminStatsStart());
                    }}
                    className="text-xs text-white hover:text-white px-3 py-1 rounded-md border border-white/30 hover:bg-white/10 transition-colors">
                    Refresh
                  </button>
                </div>

                {contactMessagesLoading && (!contactMessages || contactMessages.length === 0) &&
                  <p className="text-white drop-shadow-md text-sm">Loading messages…</p>
                }

                {!contactMessagesLoading && contactMessages?.length === 0 &&
                  <p className="text-white drop-shadow-md text-sm">No contact messages yet — submissions from the Contact page will appear here.</p>
                }

                {contactMessages?.length > 0 &&
                  <ul className="divide-y divide-white/15">
                    {contactMessages.map((m) =>
                      <li
                        key={m.id}
                        onClick={() => setOpenMessage(m)}
                        className="py-3 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors px-2 -mx-2 rounded">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-white font-medium drop-shadow-md truncate">{m.name}</div>
                            {m.status === 'new' &&
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">NEW</span>
                            }
                          </div>
                          <div className="text-xs text-white/80 mt-0.5 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                            {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                            {m.userType && <span className="text-white/60">· {m.userType}</span>}
                          </div>
                          <div className="text-sm text-white mt-1 truncate">
                            {prettySubject(m.subject)} — {m.message}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] border whitespace-nowrap capitalize ${statusPill(m.status)}`}>
                            {m.status}
                          </span>
                          <span className="text-[10px] text-white whitespace-nowrap">{fmt(m.createdAt)}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {m.status !== 'replied' &&
                              <button
                                title="Mark as replied"
                                onClick={() => dispatch(updateContactStatusStart({ id: m.id, status: 'replied' }))}
                                className="p-1 rounded hover:bg-white/20 transition-colors">
                                <Check className="h-4 w-4 text-green-300" />
                              </button>
                            }
                            <button
                              title="Delete message"
                              onClick={() => {
                                if (window.confirm('Delete this message? This cannot be undone.')) {
                                  dispatch(deleteContactMessageStart({ id: m.id }));
                                }
                              }}
                              className="p-1 rounded hover:bg-white/20 transition-colors">
                              <Trash2 className="h-4 w-4 text-red-300" />
                            </button>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                }
              </Panel>
            </div>

            {/* Message-detail modal — portalled to document.body. items-start
                + top padding keeps the panel below the fixed Header (z-50);
                inline zIndex beats any stacking context. */}
            {openMessage && typeof document !== 'undefined' && createPortal(
              <div
                className="fixed inset-0 flex items-start justify-center p-4 pt-24 overflow-y-auto"
                style={{ background: 'rgba(0, 69, 113, 0.75)', backdropFilter: 'blur(4px)', zIndex: 999999 }}
                onClick={() => setOpenMessage(null)}>
                <div
                  className="relative w-full max-w-lg rounded-2xl p-6 pt-10 my-auto"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                  onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setOpenMessage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 transition-colors">
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <h3 className="text-xl text-white drop-shadow-lg mb-1">{openMessage.name}</h3>
                  <p className="text-sm text-white mb-3 flex flex-wrap gap-3">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{openMessage.email}</span>
                    {openMessage.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{openMessage.phone}</span>}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-white mb-4 pt-3 border-t border-white/15">
                    <div><div className="text-xs text-white/70">Subject</div><div>{prettySubject(openMessage.subject)}</div></div>
                    <div><div className="text-xs text-white/70">I am a</div><div className="capitalize">{openMessage.userType || '—'}</div></div>
                    <div><div className="text-xs text-white/70">Status</div><div className="capitalize">{openMessage.status}</div></div>
                    <div><div className="text-xs text-white/70">Received</div><div>{fmt(openMessage.createdAt)}</div></div>
                  </div>
                  <div className="pt-3 border-t border-white/15">
                    <div className="text-xs text-white/70 mb-1">Message</div>
                    <p className="text-sm text-white whitespace-pre-line leading-relaxed">{openMessage.message}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-5">
                    <a
                      href={`mailto:${openMessage.email}?subject=Re:%20${encodeURIComponent(prettySubject(openMessage.subject))}`}
                      className="px-4 py-2 rounded-lg bg-coral-orange text-black text-sm font-semibold hover:bg-coral-orange/90 transition-all">
                      Reply via Email
                    </a>
                    <button
                      onClick={() => setOpenMessage(null)}
                      className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm hover:bg-white/20 transition-all">
                      Close
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Pending-approval detail modal — portalled to document.body. The
                wrapper uses items-start + top padding so the panel naturally
                sits BELOW the fixed Header (z-50), and inline zIndex makes
                sure no other stacking context can outrank it. */}
            {openPending && typeof document !== 'undefined' && createPortal(
              <div
                className="fixed inset-0 flex items-start justify-center p-4 pt-24 overflow-y-auto"
                style={{ background: 'rgba(0, 69, 113, 0.75)', backdropFilter: 'blur(4px)', zIndex: 999999 }}
                onClick={() => setOpenPending(null)}>
                <div
                  className="relative w-full max-w-2xl rounded-2xl p-6 pt-10 my-auto"
                  style={panelStyle}
                  onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setOpenPending(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 transition-colors">
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-yellow-300" />
                    <span className="text-xs uppercase tracking-wider text-yellow-300">Pending approval</span>
                  </div>
                  <h3 className="text-xl text-white drop-shadow-lg mb-1">
                    {openPending.businessName ||
                      `${openPending.firstName || ''} ${openPending.lastName || ''}`.trim() ||
                      openPending.email}
                  </h3>
                  <p className="text-sm text-white/80 mb-4">
                    {prettyRole(openPending.role)} · Applied {fmt(openPending.createdAt)}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white pt-3 border-t border-white/15">
                    <DetailRow label="Full name"   value={`${openPending.firstName || ''} ${openPending.lastName || ''}`.trim() || '—'} />
                    <DetailRow label="Email"       value={openPending.email || '—'} icon={Mail} />
                    <DetailRow label="Phone"       value={openPending.phone || '—'} icon={Phone} />
                    <DetailRow label="Register as" value={openPending.registerAs || '—'} capitalize />
                    <DetailRow label="Business name" value={openPending.businessName || '—'} />
                    <DetailRow label="Service type"  value={openPending.serviceType?.name || '—'} />
                    <DetailRow label="Licence #"     value={openPending.licenseNumber || '—'} icon={FileBadge} />
                    <DetailRow label="Email verified" value={openPending.emailVerified ? 'Yes' : 'No'} />
                  </div>

                  <div className="pt-4 border-t border-white/15 mt-4">
                    <div className="text-xs text-white/70 mb-1">Address</div>
                    <p className="text-sm text-white flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {[openPending.streetAddress, openPending.city, openPending.state, openPending.zipCode]
                          .filter(Boolean).join(', ') || '—'}
                      </span>
                    </p>
                  </div>

                  {openPending.businessDesc &&
                    <div className="pt-4 border-t border-white/15 mt-4">
                      <div className="text-xs text-white/70 mb-1">Business description</div>
                      <p className="text-sm text-white whitespace-pre-line leading-relaxed">{openPending.businessDesc}</p>
                    </div>
                  }

                  <div className="flex justify-end gap-2 pt-5">
                    <button
                      disabled={setApprovalLoadingId === openPending.id}
                      onClick={() => decide(openPending, 'rejected')}
                      className="px-4 py-2 rounded-lg bg-white/10 border-2 border-red-300/60 text-white text-sm font-medium hover:bg-red-500/25 hover:border-red-300 transition-all disabled:opacity-60">
                      Reject
                    </button>
                    <button
                      disabled={setApprovalLoadingId === openPending.id}
                      onClick={() => decide(openPending, 'approved')}
                      className="px-4 py-2 rounded-lg bg-coral-orange text-black text-sm font-semibold hover:bg-coral-orange/90 transition-all disabled:opacity-60 flex items-center gap-1">
                      <BadgeCheck className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </>
        }
      </div>
    </div>);
}

function statusPill(status) {
  if (status === 'new')      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  if (status === 'read')     return 'bg-white/15 text-white border-white/30';
  if (status === 'replied')  return 'bg-green-500/20 text-green-300 border-green-500/30';
  if (status === 'archived') return 'bg-white/10 text-white/70 border-white/20';
  return 'bg-white/15 text-white border-white/30';
}

function prettySubject(value) {
  const map = {
    'technical-support': 'Technical Support',
    'billing':           'Billing & Payments',
    'partnership':       'Partnership Inquiry',
    'feedback':          'Feedback & Suggestions',
    'other':             'Other'
  };
  return map[value] || value || '—';
}

// ── Small presentational helpers ─────────────────────────────────────
const panelStyle = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
};

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`} style={panelStyle}>{children}</div>);
}

function Kpi({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={panelStyle}>
      <div className="flex items-center gap-3 mb-2">
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${accent}22`, border: `1px solid ${accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="text-sm text-white drop-shadow-md">{label}</div>
      </div>
      <div className="text-3xl text-white font-bold drop-shadow-lg">{value}</div>
    </div>);
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-white drop-shadow-md">{value}</span>
      <span className="text-sm text-white">{label}</span>
    </div>);
}

function List({ items, empty }) {
  if (!items || items.length === 0) {
    return <p className="text-white drop-shadow-md text-sm">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-white/15">
      {items.map((it) =>
        <li key={it.key} className="py-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-white font-medium drop-shadow-md truncate">{it.title}</div>
            {it.subtitle &&
              <div className="text-xs text-white mt-0.5 truncate">{it.subtitle}</div>
            }
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {it.badge &&
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/15 border border-white/25 text-white capitalize whitespace-nowrap">
                {it.badge}
              </span>
            }
            {it.meta &&
              <span className="text-[11px] text-white whitespace-nowrap">{it.meta}</span>
            }
          </div>
        </li>
      )}
    </ul>);
}

function prettyRole(role) {
  if (role === 'service_provider') return 'Provider';
  if (role === 'realtor')          return 'Realtor';
  if (role === 'admin')            return 'Admin';
  return 'User';
}
function fmt(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); }
  catch (_) { return ''; }
}

// ── Pending-approval helpers ─────────────────────────────────────────
function PendingHeader({ icon: Icon, title, count, loading, onRefresh }) {
  return (
    <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
      <h2 className="text-lg text-white drop-shadow-lg flex items-center gap-2">
        <Icon className="h-5 w-5" /> {title}
        <span className="text-sm text-white/80">({count})</span>
        {loading && <span className="text-[11px] text-white/70">refreshing…</span>}
      </h2>
      <button
        onClick={onRefresh}
        className="text-xs text-white hover:text-white px-3 py-1 rounded-md border border-white/30 hover:bg-white/10 transition-colors">
        Refresh
      </button>
    </div>
  );
}

function PendingError({ error }) {
  if (!error) return null;
  return <p className="text-red-300 text-sm mb-2">Failed to load: {String(error)}</p>;
}

function PendingList({ rows, emptyText, onOpen, onDecide, setApprovalLoadingId }) {
  if (!rows || rows.length === 0) {
    return <p className="text-white drop-shadow-md text-sm">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-white/15">
      {rows.map((u) =>
        <li
          key={u.id}
          onClick={() => onOpen(u)}
          className="py-3 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors px-2 -mx-2 rounded">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-white font-medium drop-shadow-md truncate">
                {u.businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                PENDING
              </span>
              {u.registerAs &&
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80 border border-white/20 capitalize">
                  {u.registerAs}
                </span>
              }
            </div>
            <div className="text-xs text-white/80 mt-0.5 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</span>
              {u.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{u.phone}</span>}
              {u.serviceType?.name && <span className="text-white/70">· {u.serviceType.name}</span>}
              {u.city && <span className="text-white/60">· {u.city}{u.state ? `, ${u.state}` : ''}</span>}
            </div>
            {u.businessDesc &&
              <div className="text-sm text-white/90 mt-1 line-clamp-2">{u.businessDesc}</div>
            }
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] text-white whitespace-nowrap">{fmt(u.createdAt)}</span>
            <div className="flex items-center gap-1 mt-1">
              <button
                title="Approve"
                disabled={setApprovalLoadingId === u.id}
                onClick={() => onDecide(u, 'approved')}
                className="p-1 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50">
                <Check className="h-4 w-4 text-green-300" />
              </button>
              <button
                title="Reject"
                disabled={setApprovalLoadingId === u.id}
                onClick={() => onDecide(u, 'rejected')}
                className="p-1 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50">
                <X className="h-4 w-4 text-red-300" />
              </button>
            </div>
          </div>
        </li>
      )}
    </ul>
  );
}

function DetailRow({ label, value, icon: Icon, capitalize }) {
  return (
    <div>
      <div className="text-xs text-white/70">{label}</div>
      <div className={`flex items-center gap-1 ${capitalize ? 'capitalize' : ''}`}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="break-all">{value}</span>
      </div>
    </div>
  );
}
