// ===== Mock Data for KueFlex =====

export const ROLES = { PATIENT: 'patient', DOCTOR: 'doctor', STAFF: 'staff', ADMIN: 'admin' }

export const SPECIALTIES = [
    'อายุรกรรม', 'ศัลยกรรม', 'กุมารเวชกรรม', 'สูติ-นรีเวชกรรม',
    'จักษุวิทยา', 'โสต ศอ นาสิก', 'จิตเวชศาสตร์', 'ออร์โธปิดิกส์'
]

export const MOCK_USERS = [
    { id: 'P001', name: 'สมชาย ใจดี', email: 'somchai@mail.com', role: 'patient', phone: '081-111-1111', active: true },
    { id: 'P002', name: 'สมหญิง รักสุข', email: 'somying@mail.com', role: 'patient', phone: '081-222-2222', active: true },
    { id: 'P003', name: 'วิชัย สุขสันต์', email: 'wichai@mail.com', role: 'patient', phone: '081-333-3333', active: true },
    { id: 'P004', name: 'จันทร์ แก้วมณี', email: 'jan@mail.com', role: 'patient', phone: '081-444-4444', active: true },
    { id: 'P005', name: 'ประภา ศรีสวัสดิ์', email: 'prapa@mail.com', role: 'patient', phone: '081-555-5555', active: true },
    { id: 'D001', name: 'นพ. สุรศักดิ์ วงศ์ประเสริฐ', email: 'surasak@hospital.com', role: 'doctor', specialty: 'อายุรกรรม', license: 'ว.12345', phone: '089-001-0001', active: true },
    { id: 'D002', name: 'พญ. นภา แสงทอง', email: 'napa@hospital.com', role: 'doctor', specialty: 'กุมารเวชกรรม', license: 'ว.23456', phone: '089-002-0002', active: true },
    { id: 'D003', name: 'นพ. ธนพล ชัยชนะ', email: 'thanapon@hospital.com', role: 'doctor', specialty: 'ศัลยกรรม', license: 'ว.34567', phone: '089-003-0003', active: true },
    { id: 'D004', name: 'พญ. กมลวรรณ รุ่งเรือง', email: 'kamonwan@hospital.com', role: 'doctor', specialty: 'สูติ-นรีเวชกรรม', license: 'ว.45678', phone: '089-004-0004', active: true },
    { id: 'D005', name: 'นพ. อนุชา พิทักษ์', email: 'anucha@hospital.com', role: 'doctor', specialty: 'จักษุวิทยา', license: 'ว.56789', phone: '089-005-0005', active: true },
    { id: 'D006', name: 'พญ. ปิยะดา สมบูรณ์', email: 'piyada@hospital.com', role: 'doctor', specialty: 'จิตเวชศาสตร์', license: 'ว.67890', phone: '089-006-0006', active: true },
    { id: 'S001', name: 'มานี จันทร์เพ็ญ', email: 'manee@hospital.com', role: 'staff', phone: '082-001-0001', active: true },
    { id: 'S002', name: 'ชูศรี ดวงแก้ว', email: 'chusri@hospital.com', role: 'staff', phone: '082-002-0002', active: true },
    { id: 'A001', name: 'Admin ระบบ', email: 'admin@hospital.com', role: 'admin', phone: '080-000-0000', active: true },
]

export const MOCK_DOCTORS = MOCK_USERS.filter(u => u.role === 'doctor')
export const MOCK_PATIENTS = MOCK_USERS.filter(u => u.role === 'patient')

// Doctor schedules (weekly)
export const MOCK_SCHEDULES = [
    { doctorId: 'D001', day: 'จันทร์', startTime: '09:00', endTime: '16:00', maxSlots: 8 },
    { doctorId: 'D001', day: 'พุธ', startTime: '09:00', endTime: '16:00', maxSlots: 8 },
    { doctorId: 'D001', day: 'ศุกร์', startTime: '09:00', endTime: '12:00', maxSlots: 4 },
    { doctorId: 'D002', day: 'จันทร์', startTime: '08:00', endTime: '15:00', maxSlots: 7 },
    { doctorId: 'D002', day: 'อังคาร', startTime: '08:00', endTime: '15:00', maxSlots: 7 },
    { doctorId: 'D002', day: 'พฤหัสบดี', startTime: '08:00', endTime: '12:00', maxSlots: 4 },
    { doctorId: 'D003', day: 'อังคาร', startTime: '10:00', endTime: '17:00', maxSlots: 7 },
    { doctorId: 'D003', day: 'พฤหัสบดี', startTime: '10:00', endTime: '17:00', maxSlots: 7 },
    { doctorId: 'D004', day: 'จันทร์', startTime: '09:00', endTime: '15:00', maxSlots: 6 },
    { doctorId: 'D004', day: 'พุธ', startTime: '09:00', endTime: '15:00', maxSlots: 6 },
    { doctorId: 'D004', day: 'ศุกร์', startTime: '09:00', endTime: '15:00', maxSlots: 6 },
    { doctorId: 'D005', day: 'อังคาร', startTime: '08:00', endTime: '14:00', maxSlots: 6 },
    { doctorId: 'D005', day: 'พฤหัสบดี', startTime: '08:00', endTime: '14:00', maxSlots: 6 },
    { doctorId: 'D006', day: 'พุธ', startTime: '09:00', endTime: '16:00', maxSlots: 7 },
    { doctorId: 'D006', day: 'ศุกร์', startTime: '09:00', endTime: '16:00', maxSlots: 7 },
]

export const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
]

const today = new Date()
const d = (offset) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + offset)
    return dt.toISOString().split('T')[0]
}

export const MOCK_APPOINTMENTS = [
    { id: 'APT001', patientId: 'P001', doctorId: 'D001', date: d(1), time: '09:00', purpose: 'ตรวจสุขภาพประจำปี', status: 'confirmed', createdAt: d(-2) },
    { id: 'APT002', patientId: 'P002', doctorId: 'D002', date: d(2), time: '10:00', purpose: 'ตรวจไข้หวัดเด็ก', status: 'confirmed', createdAt: d(-1) },
    { id: 'APT003', patientId: 'P003', doctorId: 'D003', date: d(3), time: '14:00', purpose: 'ปรึกษาอาการปวดเข่า', status: 'pending', createdAt: d(-1) },
    { id: 'APT004', patientId: 'P001', doctorId: 'D004', date: d(-5), time: '09:30', purpose: 'ตรวจครรภ์', status: 'completed', createdAt: d(-10) },
    { id: 'APT005', patientId: 'P004', doctorId: 'D001', date: d(1), time: '10:30', purpose: 'ตรวจเบาหวาน', status: 'confirmed', createdAt: d(-3) },
    { id: 'APT006', patientId: 'P005', doctorId: 'D005', date: d(4), time: '08:30', purpose: 'ตรวจสายตา', status: 'pending', createdAt: d(0) },
    { id: 'APT007', patientId: 'P002', doctorId: 'D006', date: d(5), time: '13:00', purpose: 'ปรึกษาปัญหาการนอน', status: 'confirmed', createdAt: d(-1) },
    { id: 'APT008', patientId: 'P003', doctorId: 'D001', date: d(-3), time: '11:00', purpose: 'ติดตามผลตรวจเลือด', status: 'completed', createdAt: d(-7) },
    { id: 'APT009', patientId: 'P001', doctorId: 'D002', date: d(-10), time: '09:00', purpose: 'ตรวจภูมิแพ้', status: 'completed', createdAt: d(-15) },
    { id: 'APT010', patientId: 'P004', doctorId: 'D003', date: d(7), time: '10:00', purpose: 'นัดผ่าตัดเล็ก', status: 'pending', createdAt: d(0) },
    { id: 'APT011', patientId: 'P005', doctorId: 'D001', date: d(-1), time: '14:00', purpose: 'ตรวจความดัน', status: 'cancelled', createdAt: d(-5) },
    { id: 'APT012', patientId: 'P001', doctorId: 'D003', date: d(10), time: '15:00', purpose: 'ปรึกษาศัลยกรรม', status: 'pending', createdAt: d(0) },
]

export const APPOINTMENT_STATUSES = {
    pending: { label: 'รอยืนยัน', class: 'badge-warning' },
    confirmed: { label: 'ยืนยันแล้ว', class: 'badge-success' },
    completed: { label: 'เสร็จสิ้น', class: 'badge-info' },
    cancelled: { label: 'ยกเลิก', class: 'badge-danger' },
    rescheduled: { label: 'เลื่อนนัด', class: 'badge-secondary' },
}

export const SYSTEM_SETTINGS = {
    hospitalName: 'โรงพยาบาล KueFlex',
    slotDuration: 30,
    maxAdvanceBookingDays: 30,
    workingDays: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'],
    notificationsEnabled: true,
    autoConfirm: false,
}
