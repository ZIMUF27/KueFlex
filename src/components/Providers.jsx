'use client'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'
import { RealtimeRoleStateProvider } from '@/components/RealtimeRoleState'

export default function Providers({ children, session }) {
    return (
        <SessionProvider session={session}>
            <AuthProvider>
                <AppProvider>
                    <RealtimeRoleStateProvider>
                        {children}
                    </RealtimeRoleStateProvider>
                </AppProvider>
            </AuthProvider>
        </SessionProvider>
    )
}
