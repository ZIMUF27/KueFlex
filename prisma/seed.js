const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    const hash = (pw) => bcrypt.hashSync(pw, 10)

    // --- Users ---
    const patients = await Promise.all([
        prisma.user.upsert({ where: { email: 'poo2461p@gmail.com' }, update: { phone: '081-234-5678' }, create: { email: 'poo2461p@gmail.com', password: hash('123456'), name: 'Poo', phone: '081-234-5678', role: 'PATIENT' } }),
        prisma.user.upsert({ where: { email: 'somchai@mail.com' }, update: {}, create: { email: 'somchai@mail.com', password: hash('123456'), name: 'สมชาย ใจดี', phone: '081-111-1111', role: 'PATIENT' } }),
        prisma.user.upsert({ where: { email: 'somying@mail.com' }, update: {}, create: { email: 'somying@mail.com', password: hash('123456'), name: 'สมหญิง รักสุข', phone: '081-222-2222', role: 'PATIENT' } }),
        prisma.user.upsert({ where: { email: 'wichai@mail.com' }, update: {}, create: { email: 'wichai@mail.com', password: hash('123456'), name: 'วิชัย สุขสันต์', phone: '081-333-3333', role: 'PATIENT' } }),
        prisma.user.upsert({ where: { email: 'jan@mail.com' }, update: {}, create: { email: 'jan@mail.com', password: hash('123456'), name: 'จันทร์ แก้วมณี', phone: '081-444-4444', role: 'PATIENT' } }),
        prisma.user.upsert({ where: { email: 'prapa@mail.com' }, update: {}, create: { email: 'prapa@mail.com', password: hash('123456'), name: 'ประภา ศรีสวัสดิ์', phone: '081-555-5555', role: 'PATIENT' } }),
    ])

    const doctors = await Promise.all([
        prisma.user.upsert({ where: { email: 'surasak@hospital.com' }, update: {}, create: { email: 'surasak@hospital.com', password: hash('123456'), name: 'นพ. สุรศักดิ์ วงศ์ประเสริฐ', phone: '089-001-0001', role: 'DOCTOR', specialty: 'อายุรกรรม', license: 'ว.12345' } }),
        prisma.user.upsert({ where: { email: 'napa@hospital.com' }, update: {}, create: { email: 'napa@hospital.com', password: hash('123456'), name: 'พญ. นภา แสงทอง', phone: '089-002-0002', role: 'DOCTOR', specialty: 'กุมารเวชกรรม', license: 'ว.23456' } }),
        prisma.user.upsert({ where: { email: 'thanapon@hospital.com' }, update: {}, create: { email: 'thanapon@hospital.com', password: hash('123456'), name: 'นพ. ธนพล ชัยชนะ', phone: '089-003-0003', role: 'DOCTOR', specialty: 'ศัลยกรรม', license: 'ว.34567' } }),
        prisma.user.upsert({ where: { email: 'kamonwan@hospital.com' }, update: {}, create: { email: 'kamonwan@hospital.com', password: hash('123456'), name: 'พญ. กมลวรรณ รุ่งเรือง', phone: '089-004-0004', role: 'DOCTOR', specialty: 'สูติ-นรีเวชกรรม', license: 'ว.45678' } }),
        prisma.user.upsert({ where: { email: 'anucha@hospital.com' }, update: {}, create: { email: 'anucha@hospital.com', password: hash('123456'), name: 'นพ. อนุชา พิทักษ์', phone: '089-005-0005', role: 'DOCTOR', specialty: 'จักษุวิทยา', license: 'ว.56789' } }),
        prisma.user.upsert({ where: { email: 'piyada@hospital.com' }, update: {}, create: { email: 'piyada@hospital.com', password: hash('123456'), name: 'พญ. ปิยะดา สมบูรณ์', phone: '089-006-0006', role: 'DOCTOR', specialty: 'จิตเวชศาสตร์', license: 'ว.67890' } }),
    ])

    await prisma.user.upsert({ where: { email: 'staff@hospital.com' }, update: {}, create: { email: 'staff@hospital.com', password: hash('123456'), name: 'มานี จันทร์เพ็ญ', phone: '082-001-0001', role: 'STAFF' } })
    await prisma.user.upsert({ where: { email: 'admin@hospital.com' }, update: {}, create: { email: 'admin@hospital.com', password: hash('123456'), name: 'Admin ระบบ', phone: '080-000-0000', role: 'ADMIN' } })

    // --- Schedules ---
    const scheduleData = [
        { doctorEmail: 'surasak@hospital.com', day: 'จันทร์', startTime: '09:00', endTime: '16:00', maxSlots: 8 },
        { doctorEmail: 'surasak@hospital.com', day: 'พุธ', startTime: '09:00', endTime: '16:00', maxSlots: 8 },
        { doctorEmail: 'surasak@hospital.com', day: 'ศุกร์', startTime: '09:00', endTime: '12:00', maxSlots: 4 },
        { doctorEmail: 'napa@hospital.com', day: 'จันทร์', startTime: '08:00', endTime: '15:00', maxSlots: 7 },
        { doctorEmail: 'napa@hospital.com', day: 'อังคาร', startTime: '08:00', endTime: '15:00', maxSlots: 7 },
        { doctorEmail: 'napa@hospital.com', day: 'พฤหัสบดี', startTime: '08:00', endTime: '12:00', maxSlots: 4 },
        { doctorEmail: 'thanapon@hospital.com', day: 'อังคาร', startTime: '10:00', endTime: '17:00', maxSlots: 7 },
        { doctorEmail: 'thanapon@hospital.com', day: 'พฤหัสบดี', startTime: '10:00', endTime: '17:00', maxSlots: 7 },
        { doctorEmail: 'kamonwan@hospital.com', day: 'จันทร์', startTime: '09:00', endTime: '15:00', maxSlots: 6 },
        { doctorEmail: 'kamonwan@hospital.com', day: 'พุธ', startTime: '09:00', endTime: '15:00', maxSlots: 6 },
        { doctorEmail: 'kamonwan@hospital.com', day: 'ศุกร์', startTime: '09:00', endTime: '15:00', maxSlots: 6 },
        { doctorEmail: 'anucha@hospital.com', day: 'อังคาร', startTime: '08:00', endTime: '14:00', maxSlots: 6 },
        { doctorEmail: 'anucha@hospital.com', day: 'พฤหัสบดี', startTime: '08:00', endTime: '14:00', maxSlots: 6 },
        { doctorEmail: 'piyada@hospital.com', day: 'พุธ', startTime: '09:00', endTime: '16:00', maxSlots: 7 },
        { doctorEmail: 'piyada@hospital.com', day: 'ศุกร์', startTime: '09:00', endTime: '16:00', maxSlots: 7 },
    ]

    for (const s of scheduleData) {
        const doctor = await prisma.user.findUnique({ where: { email: s.doctorEmail } })
        if (doctor) {
            await prisma.schedule.upsert({
                where: { doctorId_day: { doctorId: doctor.id, day: s.day } },
                update: {},
                create: { doctorId: doctor.id, day: s.day, startTime: s.startTime, endTime: s.endTime, maxSlots: s.maxSlots },
            })
        }
    }

    // --- Sample Appointments ---
    const d = (offset) => {
        const dt = new Date()
        dt.setDate(dt.getDate() + offset)
        return dt
    }

    const aptData = [
        { patientIdx: 0, doctorIdx: 0, date: d(1), time: '09:00', purpose: 'ตรวจสุขภาพประจำปี', status: 'CONFIRMED' },
        { patientIdx: 1, doctorIdx: 1, date: d(2), time: '10:00', purpose: 'ตรวจไข้หวัดเด็ก', status: 'CONFIRMED' },
        { patientIdx: 2, doctorIdx: 2, date: d(3), time: '14:00', purpose: 'ปรึกษาอาการปวดเข่า', status: 'PENDING' },
        { patientIdx: 0, doctorIdx: 3, date: d(-5), time: '09:30', purpose: 'ตรวจครรภ์', status: 'COMPLETED' },
        { patientIdx: 3, doctorIdx: 0, date: d(1), time: '10:30', purpose: 'ตรวจเบาหวาน', status: 'CONFIRMED' },
        { patientIdx: 4, doctorIdx: 4, date: d(4), time: '08:30', purpose: 'ตรวจสายตา', status: 'PENDING' },
        { patientIdx: 1, doctorIdx: 5, date: d(5), time: '13:00', purpose: 'ปรึกษาปัญหาการนอน', status: 'CONFIRMED' },
        { patientIdx: 2, doctorIdx: 0, date: d(-3), time: '11:00', purpose: 'ติดตามผลตรวจเลือด', status: 'COMPLETED' },
        { patientIdx: 0, doctorIdx: 1, date: d(-10), time: '09:00', purpose: 'ตรวจภูมิแพ้', status: 'COMPLETED' },
        { patientIdx: 3, doctorIdx: 2, date: d(7), time: '10:00', purpose: 'นัดผ่าตัดเล็ก', status: 'PENDING' },
        { patientIdx: 4, doctorIdx: 0, date: d(-1), time: '14:00', purpose: 'ตรวจความดัน', status: 'CANCELLED' },
        { patientIdx: 0, doctorIdx: 2, date: d(10), time: '15:00', purpose: 'ปรึกษาศัลยกรรม', status: 'PENDING' },
    ]

    for (const a of aptData) {
        await prisma.appointment.create({
            data: {
                patientId: patients[a.patientIdx].id,
                doctorId: doctors[a.doctorIdx].id,
                date: a.date,
                time: a.time,
                purpose: a.purpose,
                status: a.status,
            },
        })
    }

    // --- System Settings ---
    const settingsData = [
        { key: 'hospitalName', value: 'โรงพยาบาล KueFlex' },
        { key: 'slotDuration', value: '30' },
        { key: 'maxAdvanceBookingDays', value: '30' },
        { key: 'notificationsEnabled', value: 'true' },
        { key: 'autoConfirm', value: 'false' },
    ]
    for (const s of settingsData) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { id: s.key, key: s.key, value: s.value },
        })
    }

    console.log('✅ Seed complete!')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
