const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const accounts = [
    ['somchai@mail.com', '123456'],
    ['surasak@hospital.com', '123456'],
    ['staff@hospital.com', '123456'],
    ['admin@hospital.com', '123456'],
  ]

  for (const [email, password] of accounts) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log(email, 'NO_ROW')
      continue
    }
    const ok = await bcrypt.compare(password, user.password)
    console.log(email, ok)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
