import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { ArrowLeft, Camera, ChevronRight, KeyRound, Trash2 } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import UserAvatar from '../UserAvatar'
import { useAuth } from '../../context/AuthContext'
import { compressImageToDataUrl } from '../../lib/image'
import type { User } from '../../lib/api'
function formatMemberSince(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <span className="text-sm text-muted">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium">{value}</span>
    </div>
  )
}

interface AccountSettingsProps {
  user: User | null
  onBack: () => void
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
  onDeleteAccount: () => Promise<void>
}

export default function AccountSettings({
  user,
  onBack,
  onChangePassword,
  onDeleteAccount,
}: AccountSettingsProps) {
  const { updateAvatar } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState('')
  const [avatarSuccess, setAvatarSuccess] = useState('')
  const [updatingAvatar, setUpdatingAvatar] = useState(false)

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setChangingPassword(true)
    try {
      await onChangePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password updated successfully')
      setShowChangePassword(false)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  function closeChangePassword() {
    setShowChangePassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }

  async function handleDelete() {
    setDeleteError('')
    setDeleting(true)
    try {
      await onDeleteAccount()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  async function handleAvatarSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file')
      return
    }

    setAvatarError('')
    setAvatarSuccess('')
    setUpdatingAvatar(true)

    try {
      const dataUrl = await compressImageToDataUrl(file)
      setAvatarPreview(dataUrl)
      await updateAvatar(dataUrl)
      setAvatarPreview(null)
      setAvatarSuccess('Profile picture updated')
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to update profile picture')
      setAvatarPreview(null)
    } finally {
      setUpdatingAvatar(false)
    }
  }

  async function handleRemoveAvatar() {
    setAvatarError('')
    setAvatarSuccess('')
    setUpdatingAvatar(true)

    try {
      await updateAvatar(null)
      setAvatarPreview(null)
      setAvatarSuccess('Profile picture removed')
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to remove profile picture')
    } finally {
      setUpdatingAvatar(false)
    }
  }

  const displayAvatarUrl = avatarPreview ?? user?.avatarUrl

  return (
    <div className="min-h-full bg-background text-foreground lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 px-5 py-4 lg:border-b lg:border-border lg:px-10 lg:py-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:block">
            Profile
          </p>
          <h1 className="text-lg font-semibold lg:text-2xl lg:tracking-tight">Account</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-5 pb-8 lg:max-w-none lg:px-10 lg:pb-10">
        <div className="flex flex-col items-center rounded-2xl bg-surface px-4 py-6 ring-1 ring-border">
          <div className="relative">
            <UserAvatar name={user?.name} avatarUrl={displayAvatarUrl} size="lg" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={updatingAvatar}
              aria-label="Set profile picture"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background shadow-sm ring-2 ring-surface transition hover:opacity-90 disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>
          <p className="mt-4 text-lg font-semibold">{user?.name}</p>
          <p className="mt-0.5 text-sm text-muted">{user?.email}</p>
          {avatarSuccess && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{avatarSuccess}</p>
          )}
          {avatarError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{avatarError}</p>
          )}
        </div>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Profile
          </h2>
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={updatingAvatar}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left transition hover:bg-surface-elevated/80 disabled:opacity-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
                <Camera size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {updatingAvatar ? 'Updating picture…' : 'Set profile picture'}
                </span>
                <span className="block text-xs text-muted">Choose a photo from your device</span>
              </div>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>
            {displayAvatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={updatingAvatar}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/80 disabled:opacity-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                  <Trash2 size={16} />
                </span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Remove profile picture
                </span>
              </button>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Details
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            <DetailRow label="Name" value={user?.name ?? '—'} />
            <DetailRow label="Email" value={user?.email ?? '—'} />
            <DetailRow label="Member since" value={formatMemberSince(user?.createdAt)} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Security
          </h2>
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            {!showChangePassword ? (
              <>
                {passwordSuccess && (
                  <p className="border-b border-border px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {passwordSuccess}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPasswordSuccess('')
                    setShowChangePassword(true)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/80"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
                    <KeyRound size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium">Change password</span>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </button>
              </>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3 p-4">
                <Input
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoFocus
                />
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {passwordError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeChangePassword}
                    disabled={changingPassword}
                    className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium ring-1 ring-border"
                  >
                    Cancel
                  </button>
                  <Button type="submit" className="flex-1 py-2.5" disabled={changingPassword}>
                    {changingPassword ? 'Updating…' : 'Update'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Danger zone
          </h2>
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/80"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                  <Trash2 size={16} />
                </span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Delete account
                </span>
              </button>
            ) : (
              <div className="bg-red-50/80 p-4 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Permanently delete your account?
                </p>
                <p className="mt-1 text-xs text-muted">
                  All workouts, calories, and progress will be erased.
                </p>
                {deleteError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{deleteError}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium ring-1 ring-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
