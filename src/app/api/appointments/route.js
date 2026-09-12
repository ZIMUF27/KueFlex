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
        where,
        include: { patient: { select: { id: true, name: true, email: true, phone: true } }, doctor: { select: { id: true, name: true, specialty: true } } },
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

// PATCH /api/appointments (update status, reschedule)
export async function PATCH(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, status, date, time } = body

    const updateData = {}
    if (status) updateData.status = status
    if (date) updateData.date = new Date(date)
    if (time) updateData.time = time

    // If rescheduling, check slot availability
    if (date && time) {
        const apt = await prisma.appointment.findUnique({ where: { id } })
        const existing = await prisma.appointment.findMany({
            where: { doctorId: apt.doctorId, date: new Date(date), time, status: { notIn: ['CANCELLED'] }, id: { not: id } },
        })
        if (existing.length > 0) {
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
