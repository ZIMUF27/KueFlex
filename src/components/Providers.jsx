'use client'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'

export default function Providers({ children, session }) {
    return (
        <SessionProvider session={session}>
            <AuthProvider>
                <AppProvider>
                    {children}
                </AppProvider>
            </AuthProvider>
        </SessionProvider>
    )
}
