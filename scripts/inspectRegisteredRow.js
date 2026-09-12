const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const row = await prisma.user.findUnique({
    where: { email: 'testregister@example.com' },
    select: {
      email: true,
      name: true,
      role: true,
      active: true,
      password: true,
    },
  })

  console.log(JSON.stringify(row, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
