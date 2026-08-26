import { Candy } from 'lucide-react'
import { SettingsCard, SettingsToggle } from './SettingsUI'
import { DEFAULT_SUGAR_LIMIT_G } from '../../lib/sugarCut'

interface SugarCutHomeToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export default function SugarCutHomeToggle({ enabled, onChange }: SugarCutHomeToggleProps) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Home display
      </h2>
      <SettingsCard>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
            <Candy size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Sugar cut streak</p>
            <p className="mt-0.5 text-xs text-muted">
              Show days under {DEFAULT_SUGAR_LIMIT_G}g sugar on your home stats
            </p>
          </div>
          <SettingsToggle
            checked={enabled}
            onChange={() => onChange(!enabled)}
            label="Show sugar cut streak on home"
          />
        </div>
      </SettingsCard>
    </section>
  )
}
