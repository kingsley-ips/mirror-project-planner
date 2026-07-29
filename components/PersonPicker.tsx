import type { Person } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { setActivePersonAction } from '@/app/actions'

export default function PersonPicker({ people }: { people: Person[] }) {
  return (
    <Card>
      <h2 className="text-base font-semibold mb-1">Who are you?</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        Pick your name to see the tasks assigned to you. (Stand-in for real login for now.)
      </p>
      <div className="flex flex-col gap-2">
        {people.map((person) => (
          <form key={person.id} action={setActivePersonAction}>
            <input type="hidden" name="personId" value={person.id} />
            <Button type="submit" variant="outline" fullWidth className="justify-between">
              <span>{person.name}</span>
              <span className="text-xs" style={{ color: 'var(--faint)' }}>{person.team}</span>
            </Button>
          </form>
        ))}
        {people.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--faint)' }}>
            No one added yet — add people first.
          </p>
        )}
      </div>
    </Card>
  )
}
