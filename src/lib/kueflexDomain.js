export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
}

export const ROLE_LABELS = {
  PATIENT: 'ผู้ป่วย',
  DOCTOR: 'แพทย์',
  STAFF: 'เจ้าหน้าที่',
  ADMIN: 'ผู้ดูแลระบบ',
}

export const ROLE_DASHBOARD = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  STAFF: '/staff/dashboard',
  ADMIN: '/admin/dashboard',
}

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const ROLE_PERMISSIONS = {
  PATIENT: ['patient.dashboard', 'patient.booking', 'patient.appointments'],
  DOCTOR: ['doctor.dashboard', 'doctor.calendar', 'doctor.schedule', 'doctor.patients', 'doctor.workload', 'doctor.profile'],
  STAFF: ['staff.dashboard', 'staff.appointments', 'staff.doctor-schedules', 'staff.doctors'],
  ADMIN: ['admin.users', 'admin.permissions', 'admin.system-settings', 'admin.reports'],
}

export function normalizeRole(role) {
  const key = String(role || '').trim().toUpperCase()
  return Object.values(ROLES).includes(key) ? key : 'PATIENT'
}

export function makeRouteForRole(role) {
  return ROLE_DASHBOARD[normalizeRole(role)] || ROLE_DASHBOARD.PATIENT
}

export function buildAppointmentSyncPayload(appointment) {
  return {
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    staffId: appointment.staffId || null,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    notes: appointment.notes || '',
    patientName: appointment.patient?.name || null,
    doctorName: appointment.doctor?.name || null,
  }
}
