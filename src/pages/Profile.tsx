import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, Trash2, User } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, deleteAccount } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'

  async function handleDelete() {
    setError('')
    setDeleting(true)
    try {
      await deleteAccount()
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="px-5 pt-8 lg:px-10 lg:pt-10">
      <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-neutral-500">Manage your account</p>

      <div className="mt-8 flex flex-col items-center rounded-3xl bg-surface px-6 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
          {initial}
        </div>
        <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
        <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <User size={18} />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Full name</p>
            <p className="font-medium">{user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <Mail size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">Email</p>
            <p className="truncate font-medium">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          variant="outline"
          fullWidth
          className="gap-2 border-neutral-200"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Log out
        </Button>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 size={18} />
            Delete account
          </button>
        ) : (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Delete your account?</p>
            <p className="mt-1 text-sm text-red-600/80">
              This permanently removes your account and cannot be undone.
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-700">{error}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-xl bg-white py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
