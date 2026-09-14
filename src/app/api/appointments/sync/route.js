import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildAppointmentSyncPayload } from '@/lib/kueflexDomain'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await prisma.appointment.findMany({
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, name: true, specialty: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    success: true,
    data: rows.map(buildAppointmentSyncPayload),
  })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const appointment = await prisma.appointment.create({
    data: {
      patientId: body.patientId,
      doctorId: body.doctorId,
      staffId: body.staffId || null,
      date: new Date(body.date),
      time: body.time,
      status: body.status || 'PENDING',
      purpose: body.purpose || '',
      notes: body.notes || '',
    },
  })

  return NextResponse.json({ success: true, data: buildAppointmentSyncPayload(appointment) }, { status: 201 })
}
