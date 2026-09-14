import PatientBookingForm from '@/components/PatientBookingForm'
import { Suspense } from 'react'

export default function PatientBookingFormPage({ searchParams }) {
  const doctorId = searchParams?.doctorId || ''

  return (
    <Suspense fallback={<div className="p-8 text-center">กำลังโหลดฟอร์มจอง...</div>}>
      <PatientBookingForm initialDoctorId={doctorId} />
    </Suspense>
  )
}
