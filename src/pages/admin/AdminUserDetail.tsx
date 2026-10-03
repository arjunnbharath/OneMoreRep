import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import type { AdminDataSummaryItem, AdminUser } from '../../lib/api'
import { SettingsToggle } from '../../components/profile/SettingsUI'
import {
  formatBytes,
  formatDate,
  formatShortDate,
  summarizeJson,
  userInitials,
} from './adminUtils'

export type DetailTab = 'overview' | 'security' | 'data' | 'actions'

type AdminUserDetailProps = {
  selectedUser: AdminUser | null
  loadingDetail: boolean
  detailError: string
  dataSummary: AdminDataSummaryItem[]
  userData: Record<string, unknown> | null
  expandedKey: string | null
  setExpandedKey: (key: string | null) => void
  confirmClear: boolean
  setConfirmClear: (value: boolean) => void
  confirmDelete: boolean
  setConfirmDelete: (value: boolean) => void
  actionLoading: boolean
  passwordDraft: string
  setPasswordDraft: (value: string) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  passwordMessage: string
  passwordError: string
  passwordLoading: boolean
  passwordCopied: boolean
  onCopyPassword: () => void
  onClose: () => void
  onClearData: () => void
  onDeleteUser: () => void
  onResetPassword: () => void
  onGeneratePassword: () => void
  onToggleAdminAccess: () => void
  adminAccessLoading: boolean
  adminAccessMessage: string
}

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'security', label: 'Security' },
  { id: 'data', label: 'Data' },
  { id: 'actions', label: 'Actions' },
]

const PILL_PRIMARY =
  'flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition active:scale-[0.98] disabled:opacity-40'
const PILL_TONAL =
  'flex h-12 items-center justify-center rounded-full bg-foreground/[0.07] px-5 text-sm font-medium text-foreground transition active:scale-[0.98] disabled:opacity-40'
const PILL_DANGER =
  'flex h-12 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-medium text-white transition active:scale-[0.98] disabled:opacity-40'

function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="px-4 pb-2 pt-3 text-sm font-medium text-foreground/80">{children}</h3>
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={['overflow-hidden rounded-[1.5rem] bg-surface', className].join(' ')}>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-h-14 flex-col justify-center px-4 py-2.5">
      <dt className="text-sm leading-5 text-muted">{label}</dt>
      <dd className="text-base leading-6 text-foreground">{value}</dd>
    </div>
  )
}

function Avatar({ user, size = 'md' }: { user: AdminUser; size?: 'md' | 'lg' }) {
  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] font-medium text-foreground',
        size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm',
      ].join(' ')}
    >
      {userInitials(user.name)}
    </div>
  )
}

function AdminBadge() {
  return (
    <span className="shrink-0 rounded-full bg-foreground/[0.07] px-2 py-0.5 text-[11px] font-medium text-foreground">
      Admin
    </span>
  )
}

function OverviewSection({ selectedUser }: { selectedUser: AdminUser }) {
  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center gap-4 p-4">
          <Avatar user={selectedUser} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-normal tracking-tight">{selectedUser.name}</h2>
              {selectedUser.hasAdminAccess && <AdminBadge />}
            </div>
            <p className="mt-0.5 truncate text-sm text-muted">{selectedUser.email}</p>
          </div>
        </div>
      </Card>

      <section>
        <SectionLabel>Account</SectionLabel>
        <Card>
          <dl className="py-1">
            <InfoRow label="User ID" value={selectedUser.id} />
            <InfoRow
              label="Username"
              value={selectedUser.username ? `@${selectedUser.username}` : '—'}
            />
            <InfoRow label="Joined" value={formatShortDate(selectedUser.createdAt)} />
            <InfoRow
              label="Admin access"
              value={selectedUser.hasAdminAccess ? 'Enabled' : 'Disabled'}
            />
          </dl>
        </Card>
      </section>
    </div>
  )
}

function SecuritySection({
  selectedUser,
  passwordDraft,
  setPasswordDraft,
  showPassword,
  setShowPassword,
  passwordLoading,
  passwordCopied,
  passwordError,
  passwordMessage,
  adminAccessLoading,
  adminAccessMessage,
  onCopyPassword,
  onGeneratePassword,
  onResetPassword,
  onToggleAdminAccess,
}: Pick<
  AdminUserDetailProps,
  | 'selectedUser'
  | 'passwordDraft'
  | 'setPasswordDraft'
  | 'showPassword'
  | 'setShowPassword'
  | 'passwordLoading'
  | 'passwordCopied'
  | 'passwordError'
  | 'passwordMessage'
  | 'adminAccessLoading'
  | 'adminAccessMessage'
  | 'onCopyPassword'
  | 'onGeneratePassword'
  | 'onResetPassword'
  | 'onToggleAdminAccess'
>) {
  if (!selectedUser) return null

  return (
    <div className="space-y-3">
      <section>
        <SectionLabel>Password</SectionLabel>
        <Card>
          <div className="flex items-center gap-4 px-4 pt-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] text-foreground">
              <KeyRound size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-base leading-6">Reset password</p>
              <p className="text-sm leading-5 text-muted">
                The user signs in with their ID or email and this new password.
              </p>
            </div>
          </div>
          <form
            className="space-y-3 p-4"
            onSubmit={(event) => {
              event.preventDefault()
              onResetPassword()
            }}
          >
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordDraft}
                onChange={(e) => setPasswordDraft(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="h-14 w-full rounded-2xl bg-background px-4 pr-24 text-base outline-none ring-1 ring-transparent transition focus:ring-foreground/30"
              />
              <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center">
                {passwordDraft && (
                  <button
                    type="button"
                    onClick={onCopyPassword}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition active:bg-foreground/10"
                    aria-label="Copy password"
                  >
                    {passwordCopied ? (
                      <CheckCircle2 size={20} className="text-foreground" />
                    ) : (
                      <ClipboardCopy size={20} />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition active:bg-foreground/10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onGeneratePassword}
                disabled={passwordLoading}
                className={PILL_TONAL}
              >
                Generate
              </button>
              <button
                type="submit"
                disabled={passwordLoading || passwordDraft.length < 6}
                className={PILL_PRIMARY}
              >
                {passwordLoading ? 'Saving…' : 'Update'}
              </button>
            </div>
            {passwordError && (
              <p className="px-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
            )}
            {passwordMessage && (
              <div className="rounded-2xl bg-foreground/[0.05] px-4 py-3">
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="shrink-0" />
                  {passwordMessage}
                </p>
                {passwordDraft && (
                  <p className="mt-1 break-all font-mono text-sm text-muted">{passwordDraft}</p>
                )}
              </div>
            )}
          </form>
        </Card>
      </section>

      <section>
        <SectionLabel>Permissions</SectionLabel>
        <Card>
          <div className="flex min-h-[4.5rem] items-center gap-4 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] text-foreground">
              <ShieldCheck size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base leading-6">Admin panel access</p>
              <p className="text-sm leading-5 text-muted">
                {selectedUser.hasAdminAccess
                  ? 'Can open the admin panel from Settings and manage accounts.'
                  : 'Show the admin panel in this user’s Settings.'}
              </p>
            </div>
            <SettingsToggle
              label="Admin panel access"
              checked={Boolean(selectedUser.hasAdminAccess)}
              disabled={adminAccessLoading}
              onChange={onToggleAdminAccess}
            />
          </div>
          {adminAccessMessage && (
            <p className="px-4 pb-3 pl-[4.5rem] text-xs text-muted">{adminAccessMessage}</p>
          )}
        </Card>
      </section>
    </div>
  )
}

function DataSection({
  dataSummary,
  userData,
  expandedKey,
  setExpandedKey,
}: Pick<
  AdminUserDetailProps,
  'dataSummary' | 'userData' | 'expandedKey' | 'setExpandedKey'
>) {
  return (
    <section>
      <div className="flex items-center justify-between pr-4">
        <SectionLabel>Stored data</SectionLabel>
        <span className="text-sm tabular-nums text-muted">
          {dataSummary.length} {dataSummary.length === 1 ? 'key' : 'keys'}
        </span>
      </div>
      {dataSummary.length === 0 ? (
        <Card>
          <div className="px-4 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground/[0.07] text-foreground">
              <Database size={22} />
            </span>
            <p className="mt-3 text-base">No synced data</p>
            <p className="mt-1 text-sm text-muted">This account has not synced app data yet.</p>
          </div>
        </Card>
      ) : (
        <Card>
          {dataSummary.map(({ key, updatedAt, sizeBytes }) => (
            <div key={key}>
              <button
                type="button"
                onClick={() => setExpandedKey(expandedKey === key ? null : key)}
                className="flex min-h-[4.5rem] w-full items-center gap-4 px-4 py-3 text-left transition active:bg-foreground/[0.08]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] text-foreground">
                  <Database size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-base leading-6">{key}</span>
                  <span className="block text-sm leading-5 text-muted">
                    {formatBytes(sizeBytes)} · {formatDate(updatedAt)}
                    {userData?.[key] !== undefined ? ` · ${summarizeJson(userData[key])}` : ''}
                  </span>
                </span>
                <ChevronRight
                  size={20}
                  className={[
                    'shrink-0 text-muted transition',
                    expandedKey === key ? 'rotate-90' : '',
                  ].join(' ')}
                />
              </button>
              {expandedKey === key && userData?.[key] !== undefined && (
                <pre className="mx-3 mb-3 max-h-60 overflow-auto rounded-2xl bg-[#0d1117] px-4 py-3 font-mono text-[11px] leading-relaxed text-[#e6edf3]">
                  {JSON.stringify(userData[key], null, 2)}
                </pre>
              )}
            </div>
          ))}
        </Card>
      )}
    </section>
  )
}

function ActionsSection({
  selectedUser,
  confirmClear,
  setConfirmClear,
  confirmDelete,
  setConfirmDelete,
  actionLoading,
  onClearData,
  onDeleteUser,
}: Pick<
  AdminUserDetailProps,
  | 'selectedUser'
  | 'confirmClear'
  | 'setConfirmClear'
  | 'confirmDelete'
  | 'setConfirmDelete'
  | 'actionLoading'
  | 'onClearData'
  | 'onDeleteUser'
>) {
  if (!selectedUser) return null

  return (
    <div className="space-y-3">
      <section>
        <SectionLabel>Data</SectionLabel>
        <Card>
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(false)
              setConfirmClear(!confirmClear)
            }}
            className="flex min-h-[4.5rem] w-full items-center gap-4 px-4 py-3 text-left transition active:bg-foreground/[0.08]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] text-foreground">
              <Database size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base leading-6">Clear synced data</span>
              <span className="block text-sm leading-5 text-muted">
                Removes workouts, nutrition and settings stored for this account.
              </span>
            </span>
            <ChevronRight size={20} className="shrink-0 text-muted" />
          </button>
          {confirmClear && (
            <div className="space-y-3 px-4 pb-4">
              <p className="text-sm">Clear all synced data for {selectedUser.name}?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  disabled={actionLoading}
                  className={PILL_TONAL}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onClearData}
                  disabled={actionLoading}
                  className={PILL_PRIMARY}
                >
                  {actionLoading ? 'Clearing…' : 'Clear data'}
                </button>
              </div>
            </div>
          )}
        </Card>
      </section>

      <section>
        <SectionLabel>Danger zone</SectionLabel>
        <Card>
          <button
            type="button"
            onClick={() => {
              setConfirmClear(false)
              setConfirmDelete(!confirmDelete)
            }}
            className="flex min-h-[4.5rem] w-full items-center gap-4 px-4 py-3 text-left transition active:bg-foreground/[0.08]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/12 text-red-600 dark:text-red-400">
              <Trash2 size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base leading-6 text-red-600 dark:text-red-400">
                Delete account
              </span>
              <span className="block text-sm leading-5 text-muted">
                Permanently removes the account and its data.
              </span>
            </span>
            <ChevronRight size={20} className="shrink-0 text-muted" />
          </button>
          {confirmDelete && (
            <div className="space-y-3 px-4 pb-4">
              <p className="text-sm">Delete {selectedUser.name}’s account permanently?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={actionLoading}
                  className={PILL_TONAL}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onDeleteUser}
                  disabled={actionLoading}
                  className={PILL_DANGER}
                >
                  {actionLoading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}

export default function AdminUserDetail(props: AdminUserDetailProps) {
  const { selectedUser, loadingDetail, detailError, onClose } = props

  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const ready = !loadingDetail && !detailError && Boolean(selectedUser)

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="shrink-0 bg-background px-2 pt-[calc(var(--sat)+0.25rem)] lg:hidden">
        <div className="flex h-14 items-center">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full text-foreground transition active:bg-foreground/10"
            aria-label="Back"
          >
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-4 px-4 pb-4 pt-2">
          {selectedUser && <Avatar user={selectedUser} />}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[1.75rem] font-normal leading-tight tracking-tight">
              {selectedUser?.name ?? 'Loading…'}
            </h1>
            {selectedUser && <p className="truncate text-sm text-muted">{selectedUser.email}</p>}
          </div>
        </div>
        {ready && (
          <div className="flex gap-2 overflow-x-auto px-3 pb-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'h-10 shrink-0 rounded-full px-4 text-sm font-medium transition',
                  activeTab === tab.id ? 'bg-foreground text-background' : 'bg-surface text-foreground',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-3 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-md lg:flex">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">User details</p>
          <p className="truncate text-base font-semibold tracking-tight">
            {selectedUser?.name ?? 'Loading…'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-background"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(2rem,var(--sab))] pt-1 lg:px-5 lg:py-5">
        {loadingDetail ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
            <Loader2 size={18} className="animate-spin" />
            Loading account…
          </div>
        ) : detailError ? (
          <p className="rounded-[1.5rem] bg-surface px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {detailError}
          </p>
        ) : selectedUser ? (
          <>
            <div className="lg:hidden">
              {activeTab === 'overview' && <OverviewSection selectedUser={selectedUser} />}
              {activeTab === 'security' && <SecuritySection {...props} selectedUser={selectedUser} />}
              {activeTab === 'data' && <DataSection {...props} />}
              {activeTab === 'actions' && <ActionsSection {...props} selectedUser={selectedUser} />}
            </div>
            <div className="hidden space-y-6 lg:block">
              <OverviewSection selectedUser={selectedUser} />
              <SecuritySection {...props} selectedUser={selectedUser} />
              <DataSection {...props} />
              <ActionsSection {...props} selectedUser={selectedUser} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function EmptyDetailPanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/[0.07]">
        <UserRound size={28} className="text-foreground" />
      </div>
      <p className="mt-4 text-base font-medium">Select a user</p>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted">
        Tap any account to manage passwords, admin access, synced data, and account actions.
      </p>
    </div>
  )
}
