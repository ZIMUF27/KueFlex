import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { makeRouteForRole, normalizeRole } from '@/lib/kueflexDomain'

export default async function Home() {
    const session = await getServerSession(authOptions)
    if (session) {
        const role = normalizeRole(session.user.role)
        redirect(makeRouteForRole(role))
    }
    redirect('/login')
}
