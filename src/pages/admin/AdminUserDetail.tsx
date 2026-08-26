import { useState, type ReactNode } from 'react'
import {
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

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{value}</dd>
    </div>
  )
}

function OverviewSection({ selectedUser }: { selectedUser: AdminUser }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl bg-surface-elevated/70 p-4 ring-1 ring-border">
        <div
          className={[
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-semibold',
            selectedUser.hasAdminAccess
              ? 'bg-green-500/15 text-green-700 dark:text-green-400'
              : 'bg-background text-foreground ring-1 ring-border',
          ].join(' ')}
        >
          {userInitials(selectedUser.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold tracking-tight">{selectedUser.name}</h2>
            {selectedUser.hasAdminAccess && (
              <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                Admin
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">{selectedUser.email}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
        <dl className="px-4">
          <InfoRow label="User ID" value={selectedUser.id} />
          <InfoRow
            label="Username"
            value={selectedUser.username ? `@${selectedUser.username}` : '—'}
          />
          <InfoRow label="Joined" value={formatShortDate(selectedUser.createdAt)} />
          <InfoRow
            label="Admin access"
            value={
              selectedUser.hasAdminAccess ? (
                <span className="text-green-600 dark:text-green-400">Enabled</span>
              ) : (
                'Disabled'
              )
            }
          />
        </dl>
      </div>
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
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-muted" />
          <p className="text-sm font-semibold">Reset password</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          User signs in with their user ID or email and this new password.
        </p>
        <form
          className="mt-4 space-y-3"
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
              className="w-full rounded-xl border border-border bg-background py-3 pl-3 pr-20 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {passwordDraft && (
                <button
                  type="button"
                  onClick={onCopyPassword}
                  className="rounded-lg p-2 text-muted hover:bg-surface-elevated hover:text-foreground"
                  aria-label="Copy password"
                >
                  {passwordCopied ? (
                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <ClipboardCopy size={16} />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="rounded-lg p-2 text-muted hover:bg-surface-elevated hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onGeneratePassword}
              disabled={passwordLoading}
              className="rounded-xl border border-border bg-background py-3 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50"
            >
              Generate
            </button>
            <button
              type="submit"
              disabled={passwordLoading || passwordDraft.length < 6}
              className="rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition active:scale-[0.98] disabled:opacity-40"
            >
              {passwordLoading ? 'Saving…' : 'Update'}
            </button>
          </div>
        </form>
        {passwordError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{passwordError}</p>
        )}
        {passwordMessage && (
          <div className="mt-3 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400">
              <CheckCircle2 size={14} />
              {passwordMessage}
            </p>
            {passwordDraft && (
              <p className="mt-1 break-all font-mono text-xs text-green-800 dark:text-green-300">
                {passwordDraft}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-600 dark:text-green-400" />
          <p className="text-sm font-semibold">Admin panel access</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {selectedUser.hasAdminAccess
            ? 'This user sees Admin panel in Settings and can manage accounts.'
            : 'Grant access to show Admin panel in their Settings.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold',
              selectedUser.hasAdminAccess
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-surface-elevated text-muted ring-1 ring-border',
            ].join(' ')}
          >
            {selectedUser.hasAdminAccess ? 'Access granted' : 'No access'}
          </span>
          <button
            type="button"
            onClick={onToggleAdminAccess}
            disabled={adminAccessLoading}
            className={[
              'ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40',
              selectedUser.hasAdminAccess
                ? 'border border-border bg-background'
                : 'bg-green-600 text-white',
            ].join(' ')}
          >
            {adminAccessLoading
              ? 'Saving…'
              : selectedUser.hasAdminAccess
                ? 'Revoke'
                : 'Grant access'}
          </button>
        </div>
        {adminAccessMessage && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
            <CheckCircle2 size={14} />
            {adminAccessMessage}
          </p>
        )}
      </div>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel>Stored data</SectionLabel>
        <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted ring-1 ring-border">
          {dataSummary.length} keys
        </span>
      </div>
      {dataSummary.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
          <Database size={22} className="mx-auto text-muted" />
          <p className="mt-2 text-sm font-medium">No synced data</p>
          <p className="mt-1 text-xs text-muted">This account has not synced app data yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          {dataSummary.map(({ key, updatedAt, sizeBytes }, index) => (
            <div key={key} className={index > 0 ? 'border-t border-border' : ''}>
              <button
                type="button"
                onClick={() => setExpandedKey(expandedKey === key ? null : key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-surface-elevated"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{key}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatBytes(sizeBytes)} · {formatDate(updatedAt)}
                    {userData?.[key] !== undefined ? ` · ${summarizeJson(userData[key])}` : ''}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className={[
                    'shrink-0 text-muted transition',
                    expandedKey === key ? 'rotate-90' : '',
                  ].join(' ')}
                />
              </button>
              {expandedKey === key && userData?.[key] !== undefined && (
                <pre className="max-h-60 overflow-auto border-t border-border bg-[#0d1117] px-4 py-3 font-mono text-[11px] leading-relaxed text-[#e6edf3]">
                  {JSON.stringify(userData[key], null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
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
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
        <SectionLabel>Data management</SectionLabel>
        {confirmClear ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm">Clear all synced data for {selectedUser.name}?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                disabled={actionLoading}
                className="rounded-xl border border-border py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onClearData}
                disabled={actionLoading}
                className="rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white"
              >
                Clear data
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(false)
              setConfirmClear(true)
            }}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3.5 text-left text-sm ring-1 ring-border active:bg-surface-elevated"
          >
            <span className="flex items-center gap-2">
              <Database size={16} className="text-muted" />
              Clear synced data
            </span>
            <ChevronRight size={16} className="text-muted" />
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-4">
        <SectionLabel>Danger zone</SectionLabel>
        <p className="mt-1 text-xs text-muted">Permanent actions. Cannot be undone.</p>
        {confirmDelete ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Delete {selectedUser.name}&apos;s account permanently?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={actionLoading}
                className="rounded-xl border border-border py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteUser}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white"
              >
                Delete account
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirmClear(false)
              setConfirmDelete(true)
            }}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3.5 text-left text-sm text-red-600 ring-1 ring-red-500/20 active:bg-red-500/[0.04] dark:text-red-400"
          >
            <span className="flex items-center gap-2">
              <Trash2 size={16} />
              Delete account
            </span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminUserDetail(props: AdminUserDetailProps) {
  const {
    selectedUser,
    loadingDetail,
    detailError,
    onClose,
  } = props

  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-muted ring-1 ring-border lg:hidden"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <SectionLabel>User details</SectionLabel>
            <p className="truncate text-base font-semibold tracking-tight">
              {selectedUser?.name ?? 'Loading…'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-background lg:flex"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {!loadingDetail && !detailError && selectedUser && (
          <div className="flex gap-1 overflow-x-auto px-4 pb-3 lg:px-5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                  activeTab === tab.id
                    ? 'bg-foreground text-background'
                    : 'bg-surface-elevated text-muted ring-1 ring-border',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-8 lg:px-5 lg:py-5">
        {loadingDetail ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
            <Loader2 size={18} className="animate-spin" />
            Loading account…
          </div>
        ) : detailError ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
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
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated ring-1 ring-border">
        <UserRound size={28} className="text-muted" />
      </div>
      <p className="mt-4 text-base font-semibold">Select a user</p>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted">
        Tap any account to manage passwords, admin access, synced data, and account actions.
      </p>
    </div>
  )
}
