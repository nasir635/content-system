'use client'

export interface TabItem { key: string; label: string; color?: string }

export function Tabs({ tabs, active, onChange }: {
  tabs: TabItem[]; active: string; onChange: (key: string) => void
}) {
  return (
    <div className="hs-tabs overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {tabs.map(t => (
        <button
          key={t.key}
          type="button"
          className="hs-tab"
          data-active={active === t.key}
          onClick={() => onChange(t.key)}
        >
          {t.color && (
            <span
              className="inline-block rounded-full align-middle"
              style={{ width: 7, height: 7, background: t.color, marginRight: 6 }}
            />
          )}
          {t.label}
        </button>
      ))}
    </div>
  )
}
