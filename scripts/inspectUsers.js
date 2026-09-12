const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.user.findMany({
    where: {
      email: {
        in: ['somchai@mail.com','surasak@hospital.com','staff@hospital.com','admin@hospital.com']
      }
    },
    select: {
      email: true,
      name: true,
      role: true,
      active: true,
      password: true,
    }
  })

  console.log(JSON.stringify(rows, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
