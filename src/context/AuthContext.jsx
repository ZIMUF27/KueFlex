'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { MOCK_USERS, ROLES } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        if (typeof window === 'undefined') return null
        const saved = localStorage.getItem('kueflex_user')
        return saved ? JSON.parse(saved) : null
    })

    const login = useCallback((role) => {
        // Find first user matching the role for demo purposes
        const mockUser = MOCK_USERS.find(u => u.role === role)
        if (mockUser) {
            setUser(mockUser)
            if (typeof window !== 'undefined') {
                localStorage.setItem('kueflex_user', JSON.stringify(mockUser))
            }
            return mockUser
        }
        return null
    }, [])

    const loginAsUser = useCallback((userId) => {
        const mockUser = MOCK_USERS.find(u => u.id === userId)
        if (mockUser) {
            setUser(mockUser)
            if (typeof window !== 'undefined') {
                localStorage.setItem('kueflex_user', JSON.stringify(mockUser))
            }
            return mockUser
        }
        return null
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        if (typeof window !== 'undefined') {
            localStorage.removeItem('kueflex_user')
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, loginAsUser, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export default AuthContext
