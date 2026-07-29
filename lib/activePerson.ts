import 'server-only'
import { cookies } from 'next/headers'

export const ACTIVE_PERSON_COOKIE = 'mpp_active_person'

export async function getActivePersonId(): Promise<string | null> {
  const store = await cookies()
  return store.get(ACTIVE_PERSON_COOKIE)?.value ?? null
}
