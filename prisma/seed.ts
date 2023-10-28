// in this file prisma is going to execute it after it runs migrations or updates or reset the database
// this makes it easy to see the default information

import { PrismaClient } from '@prisma/client'
import curtain_fabrics from '@/vir_db/products_embroidered_sheer_curtain_fabrics.json'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      name: 'Test User',
      password: `$2y$12$GBfcgD6XwaMferSOdYGiduw3Awuo95QAPhxFE0oNJ.Ds8qj3pzEZy`
    }
  })
  console.log({ user })

  
  // const jsonData = await prisma.collections.findMany();
  // console.log(jsonData[0].data);

  // const crm_contacts = await prisma.crm_contact.findMany()
  // console.log(crm_contacts[0]);
  
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


  