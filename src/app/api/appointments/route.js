import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/appointments?patientId=xxx&doctorId=xxx&status=xxx&date=xxx
export async function GET(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const where = {}
    if (searchParams.get('patientId')) where.patientId = searchParams.get('patientId')
    if (searchParams.get('doctorId')) where.doctorId = searchParams.get('doctorId')
    if (searchParams.get('status')) where.status = searchParams.get('status')
    if (searchParams.get('date')) where.date = new Date(searchParams.get('date'))

    const appointments = await prisma.appointment.findMany({
        where: {
            ...where,
            patient: { active: true },
            doctor: { active: true },
        },
        include: {
            patient: { select: { id: true, name: true, email: true, phone: true, active: true } },
            doctor: { select: { id: true, name: true, specialty: true, active: true } },
        },
        orderBy: { date: 'desc' },
    })
    return NextResponse.json(appointments)
}

// POST /api/appointments
export async function POST(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { patientId, doctorId, date, time, purpose } = body

    // Business Rule: Check if slot is available
    const existing = await prisma.appointment.findMany({
        where: { doctorId, date: new Date(date), time, status: { notIn: ['CANCELLED'] } },
    })
    if (existing.length > 0) {
        return NextResponse.json({ error: 'ช่วงเวลานี้ถูกจองแล้ว' }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
        data: { patientId, doctorId, date: new Date(date), time, purpose, status: 'PENDING' },
        include: { patient: { select: { id: true, name: true } }, doctor: { select: { id: true, name: true } } },
    })

    return NextResponse.json(appointment, { status: 201 })
}

// PATCH /api/appointments (update status, reschedule, cancel)
export async function PATCH(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, status, date, time, notes } = body

    if (!id) {
        return NextResponse.json({ error: 'Appointment id is required' }, { status: 400 })
    }

    const existing = await prisma.appointment.findUnique({
        where: { id },
        include: { patient: { select: { id: true, name: true, role: true } }, doctor: { select: { id: true, name: true } } },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const currentRole = String(session.user.role || '').toUpperCase()

    if (currentRole === 'PATIENT' && existing.patientId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (currentRole === 'PATIENT' && status && String(status).toUpperCase() !== 'CANCELLED') {
        return NextResponse.json({ error: 'Patient can only cancel appointments' }, { status: 403 })
    }

    if (String(status || '').toUpperCase() === 'CANCELLED') {
        const reason = String(notes || '').trim()
        if (!reason) {
            return NextResponse.json({ error: 'กรุณากรอกหมายเหตุเพื่อยกเลิกการนัด' }, { status: 400 })
        }
    }

    const updateData = {}
    if (status) updateData.status = String(status).toUpperCase()
    if (date) updateData.date = new Date(date)
    if (time) updateData.time = time
    if (typeof notes === 'string') updateData.notes = notes.trim()

    if (updateData.status === 'CANCELLED') {
        updateData.notes = String(notes || '').trim() || existing.notes || 'ยกเลิกโดยผู้ป่วย'
    }

    if (date && time) {
        const existingSlots = await prisma.appointment.findMany({
            where: { doctorId: existing.doctorId, date: new Date(date), time, status: { notIn: ['CANCELLED'] }, id: { not: id } },
        })
        if (existingSlots.length > 0) {
            return NextResponse.json({ error: 'ช่วงเวลานี้ถูกจองแล้ว' }, { status: 400 })
        }
    }

    const updated = await prisma.appointment.update({
        where: { id },
        data: updateData,
        include: { patient: { select: { id: true, name: true } }, doctor: { select: { id: true, name: true } } },
    })

    return NextResponse.json(updated)
}
