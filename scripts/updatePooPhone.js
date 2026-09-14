const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'poo2461p@gmail.com'
  const phone = '081-234-5678'

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log('missing user', email)
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { phone },
  })

  console.log('updated', email, '->', phone)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
