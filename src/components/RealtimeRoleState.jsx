'use client'

import { createContext, useContext, useMemo, useState, useEffect } from 'react'

const RealtimeRoleStateContext = createContext(null)

export function RealtimeRoleStateProvider({ children }) {
  const [state, setState] = useState({
    appointments: [],
    users: [],
    schedules: [],
    lastUpdated: null,
  })

  const refresh = async () => {
    try {
      const [appointmentsRes, usersRes, schedulesRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/users'),
        fetch('/api/schedules'),
      ])

      const [appointments, users, schedules] = await Promise.all([
        appointmentsRes.ok ? appointmentsRes.json() : [],
        usersRes.ok ? usersRes.json() : [],
        schedulesRes.ok ? schedulesRes.json() : [],
      ])

      setState({ appointments, users, schedules, lastUpdated: new Date().toISOString() })
    } catch (err) {
      console.error('syncStateError', err)
    }
  }

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 5000)
    return () => clearInterval(timer)
  }, [])

  const value = useMemo(() => ({ ...state, refresh }), [state])

  return (
    <RealtimeRoleStateContext.Provider value={value}>
      {children}
    </RealtimeRoleStateContext.Provider>
  )
}

export function useRealtimeRoleState() {
  const ctx = useContext(RealtimeRoleStateContext)
  if (!ctx) return { appointments: [], users: [], schedules: [], lastUpdated: null, refresh: async () => {} }
  return ctx
}
