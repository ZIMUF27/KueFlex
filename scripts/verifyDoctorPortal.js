const fs = require('fs')
const path = require('path')

const files = [
  'src/app/doctor/dashboard/page.jsx',
  'src/app/doctor/calendar/page.jsx',
  'src/app/doctor/schedule/page.jsx',
  'src/app/doctor/patients/page.jsx',
  'src/app/doctor/workload/page.jsx',
  'src/app/doctor/profile/page.jsx',
  'src/app/api/appointments/route.js',
]

const failures = []

for (const relative of files) {
  const file = path.join(process.cwd(), relative)
  if (!fs.existsSync(file)) {
    failures.push(`${relative} missing`)
    continue
  }

  const content = fs.readFileSync(file, 'utf8')
  if (relative.startsWith('src/app/doctor/') && content.includes('Welcome to KueFlex Doctor')) {
    failures.push(`${relative} still uses placeholder heading`)
  }

  if (relative === 'src/app/api/appointments/route.js' && !content.includes('patient: { active: true }') && !content.includes('doctor: { active: true }')) {
    failures.push(`${relative} has not connected active doctor and patient filters`)
  }
}

if (failures.length) {
  console.log('Doctor portal verification failed:')
  for (const f of failures) console.log('-', f)
  process.exit(1)
}

console.log('Doctor portal verification passed.')
