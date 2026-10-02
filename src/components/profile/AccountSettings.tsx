import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { Camera, ChevronRight, KeyRound, Smartphone, Trash2 } from 'lucide-react'
import Button from '../Button'
import { SettingsHeader, SettingsRow } from './SettingsUI'
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
    <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
      <span className="text-base text-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-sm text-muted">{value}</span>
    </div>
  )
}

interface AccountSettingsProps {
  user: User | null
  /** Account lives only on this device: no email, password, or server. */
  isLocal?: boolean
  onBack: () => void
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
  onDeleteAccount: () => Promise<void>
}

export default function AccountSettings({
  user,
  isLocal = false,
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

  function handleBack() {
    if (showChangePassword) {
      closeChangePassword()
      return
    }
    if (showDeleteConfirm) {
      setShowDeleteConfirm(false)
      setDeleteError('')
      return
    }
    onBack()
  }

  return (
    <div className="min-h-full bg-background text-foreground lg:mx-auto lg:max-w-3xl">
      <SettingsHeader title="Account" subtitle="Settings" onBack={handleBack} />

      <div className="mx-auto max-w-lg space-y-3 px-3 pb-8 lg:max-w-none lg:space-y-6 lg:px-10 lg:pb-10">
        <div className="flex flex-col items-center rounded-[1.5rem] bg-surface px-4 py-6">
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
          <p className="mt-0.5 text-sm text-muted">
            {isLocal ? 'Saved on this device' : user?.email}
          </p>
          {avatarSuccess && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{avatarSuccess}</p>
          )}
          {avatarError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{avatarError}</p>
          )}
        </div>

        <section>
          <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-foreground/80">
            Profile
          </h2>
          <div className="overflow-hidden rounded-[1.5rem] bg-surface">
            <SettingsRow
              icon={<Camera />}
              label={updatingAvatar ? 'Updating picture…' : 'Profile picture'}
              onClick={() => {
                if (!updatingAvatar) fileInputRef.current?.click()
              }}
              trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
            />
            {displayAvatarUrl && (
              <SettingsRow
                icon={<Trash2 />}
                label="Remove profile picture"
                destructive
                onClick={() => {
                  if (!updatingAvatar) void handleRemoveAvatar()
                }}
              />
            )}
          </div>
        </section>

        <section>
          <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-foreground/80">
            Details
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-[1.5rem] bg-surface">
            <DetailRow
              label="Storage"
              value={isLocal ? 'This device only' : 'Online account'}
            />
            {!isLocal && (
              <DetailRow label="User ID" value={user?.username ? `@${user.username}` : '—'} />
            )}
            <DetailRow label="Name" value={user?.name ?? '—'} />
            {!isLocal && <DetailRow label="Email" value={user?.email ?? '—'} />}
            <DetailRow label="Member since" value={formatMemberSince(user?.createdAt)} />
          </div>
        </section>

        {isLocal && (
          <section>
            <div className="flex items-start gap-4 rounded-[1.5rem] bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] text-foreground">
                <Smartphone size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Your data never leaves this phone</p>
                <p className="mt-1 text-xs text-muted">
                  There is no password or online backup. Clearing the app&apos;s storage or
                  uninstalling will erase everything, so export a backup from Settings → Data
                  from time to time.
                </p>
              </div>
            </div>
          </section>
        )}

        {!isLocal && (
        <section>
          <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-foreground/80">
            Security
          </h2>
          <div className="overflow-hidden rounded-[1.5rem] bg-surface">
            {!showChangePassword ? (
              <>
                {passwordSuccess && (
                  <p className="border-b border-border px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {passwordSuccess}
                  </p>
                )}
                <SettingsRow
                  icon={<KeyRound />}
                  label="Change password"
                  onClick={() => {
                    setPasswordSuccess('')
                    setShowChangePassword(true)
                  }}
                  trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
                />
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
        )}

        <section>
          <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-foreground/80">
            Danger zone
          </h2>
          <div className="overflow-hidden rounded-[1.5rem] bg-surface">
            {!showDeleteConfirm ? (
              <SettingsRow
                icon={<Trash2 />}
                label="Delete account"
                destructive
                onClick={() => setShowDeleteConfirm(true)}
              />
            ) : (
              <div className="bg-red-50/80 p-4 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Permanently delete your account?
                </p>
                <p className="mt-1 text-xs text-muted">
                  {isLocal
                    ? 'All workouts, calories, and progress saved on this device will be erased.'
                    : 'All workouts, calories, and progress will be erased.'}
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
