import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useAuth } from '../context/AuthContext'
import {
  clearAdminUserData,
  clearAllAdminUserData,
  deleteAdminUser,
  deleteAdminUsersBulk,
  deleteAllAdminUsers,
  getAdminUser,
  getAdminUserData,
  listAdminUsers,
  resetAdminUserPassword,
  setAdminUserAccess,
  type AdminUser,
} from '../lib/api'
import AdminUserDetail, { EmptyDetailPanel } from './admin/AdminUserDetail'
import { filterUsers, randomPassword, userInitials, type UserFilter } from './admin/adminUtils'

function StatPill({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: 'green'
}) {
  return (
    <div className="flex min-w-[8.5rem] shrink-0 snap-start flex-col rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
      <p
        className={[
          'text-xl font-semibold tabular-nums tracking-tight',
          accent === 'green' ? 'text-green-600 dark:text-green-400' : '',
        ].join(' ')}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-muted">{label}</p>
    </div>
  )
}

function UserRowCard({
  user,
  selected,
  checked,
  onToggle,
  onOpen,
}: {
  user: AdminUser
  selected: boolean
  checked: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  const hasAdminAccess = Boolean(user.hasAdminAccess)

  return (
    <div
      className={[
        'flex items-center gap-3 border-b border-border px-4 py-3.5 transition md:hidden',
        hasAdminAccess ? 'bg-green-500/[0.05]' : '',
        selected ? 'bg-surface-elevated/80' : '',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-5 w-5 shrink-0 rounded-md border-border accent-foreground"
        aria-label={`Select ${user.name}`}
      />
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold',
            hasAdminAccess
              ? 'bg-green-500/15 text-green-700 dark:text-green-400'
              : 'bg-surface-elevated ring-1 ring-border',
          ].join(' ')}
        >
          {userInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{user.name}</p>
            {hasAdminAccess && (
              <span className="shrink-0 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                Admin
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted">{user.email}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {user.dataKeys ?? 0} data keys · ID {user.id}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted" />
      </button>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { token: adminToken, username: adminUsername, logout: adminLogout } = useAdminAuth()
  const { user, token: userToken } = useAuth()
  const token = adminToken ?? (user?.hasAdminAccess ? userToken : null)
  const displayName = adminUsername ?? user?.name ?? user?.email ?? '—'
  const isSuperAdmin = Boolean(adminToken)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [userFilter, setUserFilter] = useState<UserFilter>('all')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [showBulkMenu, setShowBulkMenu] = useState(false)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [dataSummary, setDataSummary] = useState<import('../lib/api').AdminDataSummaryItem[]>([])
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const [passwordDraft, setPasswordDraft] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [adminAccessLoading, setAdminAccessLoading] = useState(false)
  const [adminAccessMessage, setAdminAccessMessage] = useState('')
  const [slideOpen, setSlideOpen] = useState(false)

  const loadUsers = useCallback(async () => {
    if (!token) return
    setLoadingUsers(true)
    setUsersError('')
    try {
      const { users: list } = await listAdminUsers(token, { search: query, limit: 500 })
      setUsers(list)
      setCheckedIds((prev) => new Set([...prev].filter((id) => list.some((u) => u.id === id))))
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }, [token, query])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const closeDetail = useCallback(() => {
    setSlideOpen(false)
    window.setTimeout(() => {
      setSelectedId(null)
      setSelectedUser(null)
      setUserData(null)
      setDataSummary([])
      setDetailError('')
      setExpandedKey(null)
      setConfirmClear(false)
      setConfirmDelete(false)
      setPasswordDraft('')
      setShowPassword(false)
      setPasswordMessage('')
      setPasswordError('')
      setPasswordCopied(false)
      setAdminAccessMessage('')
    }, 200)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const frame = window.requestAnimationFrame(() => setSlideOpen(true))
    return () => window.cancelAnimationFrame(frame)
  }, [selectedId])

  useEffect(() => {
    if (!selectedId) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDetail()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, closeDetail])

  const loadUserDetail = useCallback(
    async (userId: number) => {
      if (!token) return
      setSelectedId(userId)
      setLoadingDetail(true)
      setDetailError('')
      setUserData(null)
      setExpandedKey(null)
      setConfirmClear(false)
      setConfirmDelete(false)
      setPasswordDraft('')
      setPasswordMessage('')
      setPasswordError('')
      setPasswordCopied(false)
      setAdminAccessMessage('')

      try {
        const [{ user, dataSummary: summary }, { data }] = await Promise.all([
          getAdminUser(token, userId),
          getAdminUserData(token, userId),
        ])
        setSelectedUser(user)
        setDataSummary(summary)
        setUserData(data)
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : 'Failed to load user')
        setSelectedUser(null)
        setDataSummary([])
      } finally {
        setLoadingDetail(false)
      }
    },
    [token],
  )

  const filteredUsers = useMemo(() => filterUsers(users, userFilter), [users, userFilter])
  const allSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => checkedIds.has(user.id))
  const selectedCount = checkedIds.size
  const detailOpen = Boolean(selectedId && slideOpen)
  const totalDataKeys = useMemo(
    () => users.reduce((sum, user) => sum + (user.dataKeys ?? 0), 0),
    [users],
  )
  const adminAccessCount = useMemo(
    () => users.filter((user) => user.hasAdminAccess).length,
    [users],
  )

  function handleSignOut() {
    if (isSuperAdmin) {
      adminLogout()
      navigate('/login', { replace: true })
      return
    }
    navigate('/home', { replace: true })
  }

  function toggleAll() {
    if (allSelected) setCheckedIds(new Set())
    else setCheckedIds(new Set(filteredUsers.map((user) => user.id)))
  }

  function toggleOne(userId: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  async function handleClearData() {
    if (!token || !selectedUser) return
    setActionLoading(true)
    setActionMessage('')
    try {
      await clearAdminUserData(token, selectedUser.id)
      setActionMessage('User data cleared successfully.')
      setConfirmClear(false)
      await loadUserDetail(selectedUser.id)
      await loadUsers()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to clear data')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteUser() {
    if (!token || !selectedUser) return
    setActionLoading(true)
    setActionMessage('')
    try {
      await deleteAdminUser(token, selectedUser.id)
      setConfirmDelete(false)
      setCheckedIds((prev) => {
        const next = new Set(prev)
        next.delete(selectedUser.id)
        return next
      })
      closeDetail()
      setActionMessage('User account deleted.')
      await loadUsers()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteSelected() {
    if (!token || selectedCount === 0) return
    setActionLoading(true)
    setActionMessage('')
    try {
      const ids = [...checkedIds]
      const { deleted } = await deleteAdminUsersBulk(token, ids)
      setConfirmDeleteSelected(false)
      setCheckedIds(new Set())
      setShowBulkMenu(false)
      if (selectedId && ids.includes(selectedId)) closeDetail()
      setActionMessage(`Deleted ${deleted} account${deleted === 1 ? '' : 's'}.`)
      await loadUsers()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to delete selected')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!token || !selectedUser) return
    if (passwordDraft.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordMessage('')
    setPasswordCopied(false)
    try {
      await resetAdminUserPassword(token, selectedUser.id, passwordDraft)
      setShowPassword(true)
      setPasswordMessage('Password updated. Copy it and share it with the user securely.')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleCopyPassword() {
    if (!passwordDraft) return
    try {
      await navigator.clipboard.writeText(passwordDraft)
      setPasswordCopied(true)
      window.setTimeout(() => setPasswordCopied(false), 2000)
    } catch {
      setPasswordError('Could not copy to clipboard')
    }
  }

  async function handleToggleAdminAccess() {
    if (!token || !selectedUser) return
    const nextEnabled = !selectedUser.hasAdminAccess
    setAdminAccessLoading(true)
    setAdminAccessMessage('')
    try {
      const { user: updatedUser } = await setAdminUserAccess(token, selectedUser.id, nextEnabled)
      setSelectedUser(updatedUser)
      setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? { ...item, ...updatedUser } : item)))
      setAdminAccessMessage(
        nextEnabled ? 'Admin panel access granted.' : 'Admin panel access revoked.',
      )
    } catch (err) {
      setAdminAccessMessage(err instanceof Error ? err.message : 'Failed to update admin access')
    } finally {
      setAdminAccessLoading(false)
    }
  }

  async function handleClearAllData() {
    if (!token) return
    setActionLoading(true)
    setActionMessage('')
    try {
      await clearAllAdminUserData(token)
      setConfirmClearAll(false)
      setShowBulkMenu(false)
      setActionMessage('All user data cleared.')
      if (selectedId) await loadUserDetail(selectedId)
      await loadUsers()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to clear all data')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteAllUsers() {
    if (!token) return
    setActionLoading(true)
    setActionMessage('')
    try {
      const { deleted } = await deleteAllAdminUsers(token)
      setConfirmDeleteAll(false)
      setShowBulkMenu(false)
      setCheckedIds(new Set())
      closeDetail()
      setActionMessage(`Deleted ${deleted} account${deleted === 1 ? '' : 's'}.`)
      await loadUsers()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to delete all users')
    } finally {
      setActionLoading(false)
    }
  }

  const detailPanelProps = {
    selectedUser,
    loadingDetail,
    detailError,
    dataSummary,
    userData,
    expandedKey,
    setExpandedKey,
    confirmClear,
    setConfirmClear,
    confirmDelete,
    setConfirmDelete,
    actionLoading,
    passwordDraft,
    setPasswordDraft,
    showPassword,
    setShowPassword,
    passwordMessage,
    passwordError,
    passwordLoading,
    passwordCopied,
    onCopyPassword: () => void handleCopyPassword(),
    onClose: closeDetail,
    onClearData: () => void handleClearData(),
    onDeleteUser: () => void handleDeleteUser(),
    onResetPassword: () => void handleResetPassword(),
    onGeneratePassword: () => {
      const next = randomPassword()
      setPasswordDraft(next)
      setShowPassword(true)
      setPasswordError('')
      setPasswordMessage('')
      setPasswordCopied(false)
    },
    onToggleAdminAccess: () => void handleToggleAdminAccess(),
    adminAccessLoading,
    adminAccessMessage,
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 lg:px-8 lg:py-4">
          <Link
            to="/home"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-muted ring-1 ring-border transition active:scale-95"
            aria-label="Back to app"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Admin</p>
              <h1 className="truncate text-base font-semibold tracking-tight lg:text-lg">
                User Management
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={loadingUsers}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated text-muted ring-1 ring-border transition active:scale-95 disabled:opacity-50 lg:hidden"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loadingUsers ? 'animate-spin' : ''} />
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="max-w-[180px] truncate rounded-xl bg-surface-elevated px-3 py-2 text-xs text-muted ring-1 ring-border">
              {displayName}
            </span>
            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loadingUsers}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-elevated px-3 py-2 text-sm font-medium ring-1 ring-border transition hover:bg-background disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl bg-surface-elevated px-3 py-2 text-sm font-medium ring-1 ring-border transition hover:bg-background"
            >
              {isSuperAdmin ? 'Sign out' : 'Back to app'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-4 pb-28 lg:gap-5 lg:px-8 lg:py-6 lg:pb-6">
        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
          <StatPill label="Total accounts" value={users.length} />
          <StatPill label="Synced data keys" value={totalDataKeys} />
          <StatPill label="Admin access" value={adminAccessCount} accent="green" />
          <StatPill label="Signed in as" value={displayName} />
        </div>

        {actionMessage && (
          <div className="flex items-start gap-2 rounded-2xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300">{actionMessage}</p>
            <button
              type="button"
              onClick={() => setActionMessage('')}
              className="ml-auto shrink-0 rounded-lg p-1 text-muted hover:text-foreground"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div
          className={[
            'grid min-h-0 flex-1 gap-4 lg:min-h-[calc(100dvh-14rem)]',
            detailOpen ? 'lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)]' : 'lg:grid-cols-1',
          ].join(' ')}
        >
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            <div className="shrink-0 space-y-3 border-b border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Users
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {filteredUsers.length} account{filteredUsers.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkMenu(true)}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-surface-elevated px-3 text-sm font-medium text-muted ring-1 ring-border lg:hidden"
                >
                  <MoreHorizontal size={16} />
                  Actions
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setQuery(search.trim())
                }}
                className="relative"
              >
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, or ID"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                />
              </form>

              <div className="flex gap-2">
                {(['all', 'admins'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setUserFilter(filter)}
                    className={[
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                      userFilter === filter
                        ? 'bg-foreground text-background'
                        : 'bg-surface-elevated text-muted ring-1 ring-border',
                    ].join(' ')}
                  >
                    {filter === 'all' ? 'All users' : 'Admins only'}
                  </button>
                ))}
              </div>

              <div className="hidden flex-wrap items-center gap-2 border-t border-border pt-3 lg:flex">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border accent-foreground"
                  />
                  Select all
                </label>
                {selectedCount > 0 && (
                  <span className="text-xs text-muted">{selectedCount} selected</span>
                )}
                {confirmDeleteSelected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteSelected(false)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSelected()}
                      disabled={actionLoading}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Delete selected
                    </button>
                  </>
                ) : (
                  selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteSelected(true)}
                      className="rounded-lg border border-red-500/20 bg-red-500/[0.04] px-3 py-1.5 text-xs font-medium text-red-600"
                    >
                      Delete selected
                    </button>
                  )
                )}
                <span className="mx-1 h-4 w-px bg-border" />
                {confirmClearAll ? (
                  <>
                    <button type="button" onClick={() => setConfirmClearAll(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
                      Cancel
                    </button>
                    <button type="button" onClick={() => void handleClearAllData()} disabled={actionLoading} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">
                      Confirm clear all
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setConfirmDeleteAll(false); setConfirmClearAll(true) }} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
                    Clear all data
                  </button>
                )}
                {confirmDeleteAll ? (
                  <>
                    <button type="button" onClick={() => setConfirmDeleteAll(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
                      Cancel
                    </button>
                    <button type="button" onClick={() => void handleDeleteAllUsers()} disabled={actionLoading} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                      Delete all {users.length}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setConfirmClearAll(false); setConfirmDeleteAll(true) }} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-600">
                    Delete all accounts
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
                  <Loader2 size={18} className="animate-spin" />
                  Loading users…
                </div>
              ) : usersError ? (
                <p className="p-6 text-sm text-red-600 dark:text-red-400">{usersError}</p>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                  <Users size={28} className="text-muted" />
                  <p className="mt-3 text-sm font-medium">No users found</p>
                  <p className="mt-1 text-xs text-muted">Try a different search or filter.</p>
                </div>
              ) : (
                <>
                  <div className="md:hidden">
                    <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-5 w-5 rounded-md border-border accent-foreground"
                      />
                      <span className="text-xs font-medium text-muted">Select all</span>
                    </div>
                    {filteredUsers.map((user) => (
                      <UserRowCard
                        key={user.id}
                        user={user}
                        selected={selectedId === user.id}
                        checked={checkedIds.has(user.id)}
                        onToggle={() => toggleOne(user.id)}
                        onOpen={() => void loadUserDetail(user.id)}
                      />
                    ))}
                  </div>

                  <table className="hidden w-full text-left text-sm md:table">
                    <thead className="sticky top-0 z-10 border-b border-border bg-surface text-[11px] font-semibold uppercase tracking-wide text-muted">
                      <tr>
                        <th className="w-10 px-3 py-3" />
                        <th className="px-4 py-3 font-medium">Account</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 text-right font-medium">Data</th>
                        <th className="w-8 px-2 py-3" aria-hidden />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((user) => {
                        const selected = selectedId === user.id
                        const hasAdminAccess = Boolean(user.hasAdminAccess)
                        return (
                          <tr
                            key={user.id}
                            className={[
                              'transition',
                              hasAdminAccess ? 'bg-green-500/[0.06] hover:bg-green-500/[0.1]' : 'hover:bg-surface-elevated/50',
                              selected ? 'ring-1 ring-inset ring-foreground/10' : '',
                            ].join(' ')}
                          >
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={checkedIds.has(user.id)}
                                onChange={() => toggleOne(user.id)}
                                className="h-4 w-4 rounded border-border accent-foreground"
                              />
                            </td>
                            <td className="cursor-pointer px-4 py-3" onClick={() => void loadUserDetail(user.id)}>
                              <div className="flex items-center gap-3">
                                <div
                                  className={[
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold',
                                    hasAdminAccess
                                      ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                                      : 'bg-surface-elevated ring-1 ring-border',
                                  ].join(' ')}
                                >
                                  {userInitials(user.name)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate font-medium">{user.name}</p>
                                    {hasAdminAccess && (
                                      <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-green-700 dark:text-green-400">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="max-w-[220px] cursor-pointer truncate px-4 py-3 text-muted" onClick={() => void loadUserDetail(user.id)}>
                              {user.email}
                            </td>
                            <td className="cursor-pointer px-4 py-3 text-right tabular-nums text-muted" onClick={() => void loadUserDetail(user.id)}>
                              {user.dataKeys ?? 0}
                            </td>
                            <td className="cursor-pointer px-2 py-3 text-muted" onClick={() => void loadUserDetail(user.id)}>
                              <ChevronRight size={15} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </section>

          <section className="hidden min-h-[480px] overflow-hidden rounded-2xl bg-surface ring-1 ring-border lg:flex lg:min-h-0 lg:flex-col">
            {selectedId ? (
              <AdminUserDetail {...detailPanelProps} />
            ) : (
              <>
                <div className="shrink-0 border-b border-border px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    User details
                  </p>
                  <p className="mt-1 text-base font-semibold">Select a user</p>
                </div>
                <EmptyDetailPanel />
              </>
            )}
          </section>
        </div>
      </main>

      {selectedCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-4 backdrop-blur-md lg:hidden pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <span className="text-sm font-medium">{selectedCount} selected</span>
            {confirmDeleteSelected ? (
              <>
                <button type="button" onClick={() => setConfirmDeleteSelected(false)} className="ml-auto rounded-xl border border-border px-4 py-2.5 text-sm">
                  Cancel
                </button>
                <button type="button" onClick={() => void handleDeleteSelected()} disabled={actionLoading} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">
                  Delete
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDeleteSelected(true)} className="ml-auto rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">
                Delete selected
              </button>
            )}
          </div>
        </div>
      )}

      {showBulkMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close actions" onClick={() => setShowBulkMenu(false)} className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ring-1 ring-border">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <p className="text-base font-semibold">Bulk actions</p>
            <p className="mt-1 text-sm text-muted">Manage all accounts at once</p>
            <div className="mt-4 space-y-2">
              {confirmClearAll ? (
                <div className="space-y-2">
                  <p className="text-sm">Clear synced data for every user?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setConfirmClearAll(false)} className="rounded-xl border border-border py-3 text-sm">Cancel</button>
                    <button type="button" onClick={() => void handleClearAllData()} disabled={actionLoading} className="rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white">Confirm</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => { setConfirmDeleteAll(false); setConfirmClearAll(true) }} className="w-full rounded-xl bg-surface-elevated py-3.5 text-sm font-medium ring-1 ring-border">
                  Clear all user data
                </button>
              )}
              {confirmDeleteAll ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">Delete all {users.length} accounts?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setConfirmDeleteAll(false)} className="rounded-xl border border-border py-3 text-sm">Cancel</button>
                    <button type="button" onClick={() => void handleDeleteAllUsers()} disabled={actionLoading} className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white">Delete all</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => { setConfirmClearAll(false); setConfirmDeleteAll(true) }} className="w-full rounded-xl py-3.5 text-sm font-semibold text-red-600 ring-1 ring-red-500/20">
                  Delete all accounts
                </button>
              )}
              <button type="button" onClick={() => setShowBulkMenu(false)} className="w-full rounded-xl py-3.5 text-sm text-muted">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close user details"
            onClick={closeDetail}
            className={[
              'absolute inset-0 bg-black/50 transition-opacity duration-200',
              slideOpen ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />
          <div
            className={[
              'absolute inset-0 flex flex-col bg-background transition-transform duration-200 ease-out',
              slideOpen ? 'translate-y-0' : 'translate-y-full',
            ].join(' ')}
          >
            <AdminUserDetail {...detailPanelProps} />
          </div>
        </div>
      )}
    </div>
  )
}
