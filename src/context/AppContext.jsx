'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { MOCK_APPOINTMENTS, MOCK_SCHEDULES, MOCK_USERS, MOCK_DOCTORS, TIME_SLOTS, SYSTEM_SETTINGS } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [appointments, setAppointments] = useState(() => {
        if (typeof window === 'undefined') return MOCK_APPOINTMENTS
        const saved = localStorage.getItem('kueflex_appointments')
        return saved ? JSON.parse(saved) : MOCK_APPOINTMENTS
    })
    const [schedules, setSchedules] = useState(() => {
        if (typeof window === 'undefined') return MOCK_SCHEDULES
        const saved = localStorage.getItem('kueflex_schedules')
        return saved ? JSON.parse(saved) : MOCK_SCHEDULES
    })
    const [users, setUsers] = useState(() => {
        if (typeof window === 'undefined') return MOCK_USERS
        const saved = localStorage.getItem('kueflex_users')
        return saved ? JSON.parse(saved) : MOCK_USERS
    })
    const [settings, setSettings] = useState(() => {
        if (typeof window === 'undefined') return SYSTEM_SETTINGS
        const saved = localStorage.getItem('kueflex_settings')
        return saved ? JSON.parse(saved) : SYSTEM_SETTINGS
    })
    const [notifications, setNotifications] = useState([])
    const [toasts, setToasts] = useState([])

    const save = (key, data) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(data))
        }
    }

    // Toast notifications
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }, [])

    // Get available time slots for a doctor on a specific date
    const getAvailableSlots = useCallback((doctorId, date) => {
        const dateObj = new Date(date)
        const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
        const dayName = dayNames[dateObj.getDay()]

        const doctorSchedule = schedules.filter(s => s.doctorId === doctorId && s.day === dayName)
        if (doctorSchedule.length === 0) return []

        const schedule = doctorSchedule[0]
        const allSlots = TIME_SLOTS.filter(t => t >= schedule.startTime && t < schedule.endTime)

        const bookedSlots = appointments
            .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
            .map(a => a.time)

        return allSlots.map(slot => ({
            time: slot,
            available: !bookedSlots.includes(slot),
        }))
    }, [appointments, schedules])

    // Create appointment
    const createAppointment = useCallback((data) => {
        const newApt = {
            id: 'APT' + String(Date.now()).slice(-6),
            ...data,
            status: settings.autoConfirm ? 'confirmed' : 'pending',
            createdAt: new Date().toISOString().split('T')[0],
        }
        const updated = [...appointments, newApt]
        setAppointments(updated)
        save('kueflex_appointments', updated)

        // Add notification for doctor
        const doctor = users.find(u => u.id === data.doctorId)
        const patient = users.find(u => u.id === data.patientId)
        if (doctor && patient) {
            addToast(`📋 นัดหมายใหม่: ${patient.name} จองพบ ${doctor.name} วันที่ ${data.date} เวลา ${data.time}`, 'success')
            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: `นัดหมายใหม่จาก ${patient.name}`,
                time: new Date().toLocaleTimeString('th-TH'),
                read: false,
                doctorId: data.doctorId,
            }])
        }
        return newApt
    }, [appointments, settings, users, addToast])

    // Update appointment
    const updateAppointment = useCallback((id, updates) => {
        const updated = appointments.map(a => a.id === id ? { ...a, ...updates } : a)
        setAppointments(updated)
        save('kueflex_appointments', updated)
        return updated.find(a => a.id === id)
    }, [appointments])

    // Cancel appointment
    const cancelAppointment = useCallback((id) => {
        return updateAppointment(id, { status: 'cancelled' })
    }, [updateAppointment])

    // Reschedule appointment
    const rescheduleAppointment = useCallback((id, newDate, newTime) => {
        return updateAppointment(id, { date: newDate, time: newTime, status: 'pending' })
    }, [updateAppointment])

    // Update schedules
    const updateSchedules = useCallback((newSchedules) => {
        setSchedules(newSchedules)
        save('kueflex_schedules', newSchedules)
    }, [])

    // Update users
    const updateUsers = useCallback((newUsers) => {
        setUsers(newUsers)
        save('kueflex_users', newUsers)
    }, [])

    // Update settings
    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const merged = { ...prev, ...newSettings }
            save('kueflex_settings', merged)
            return merged
        })
    }, [])

    // Get doctor workload
    const getDoctorWorkload = useCallback((doctorId) => {
        const doctorApts = appointments.filter(a => a.doctorId === doctorId && a.status !== 'cancelled')
        const totalSlots = schedules.filter(s => s.doctorId === doctorId).reduce((sum, s) => sum + s.maxSlots, 0)
        return { booked: doctorApts.length, totalSlots, percentage: totalSlots > 0 ? Math.round((doctorApts.length / totalSlots) * 100) : 0 }
    }, [appointments, schedules])

    const doctors = users.filter(u => u.role === 'doctor')
    const patients = users.filter(u => u.role === 'patient')

    return (
        <AppContext.Provider value={{
            appointments, schedules, users, settings, notifications, toasts, doctors, patients,
            getAvailableSlots, createAppointment, updateAppointment, cancelAppointment,
            rescheduleAppointment, updateSchedules, updateUsers, updateSettings,
            getDoctorWorkload, addToast, setNotifications,
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used within AppProvider')
    return ctx
}

export default AppContext
