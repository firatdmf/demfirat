// in this file prisma is going to execute it after it runs migrations or updates or reset the database
// this makes it easy to see the default information

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
// import curtain_fabrics from '@/vir_db/products_embroidered_sheer_curtain_fabrics.json'
// const jsFile = require("../src/vir_db/classify_embroidered_sheer_curtain_fabrics.js");

const prisma = new PrismaClient()


async function main() {
  // 12 is the number of salts around it
  const password = await hash('2448', 12)
  const user = await prisma.user.upsert({
    where: { username: 'konfeksiyon' },
    update: {},
    create: {
      username: 'konfeksiyon',
      email: 'konfeksiyon@demfirat.com',
      name: 'Karven Konfeksiyon',
      // password: `$2y$12$GBfcgD6XwaMferSOdYGiduw3Awuo95QAPhxFE0oNJ.Ds8qj3pzEZy`
      password,
    }
  })
  const user2 = await prisma.user.upsert({
    where: { username: 'firat' },
    update: {},
    create: {
      username: 'firat',
      email: 'firatkarven@gmail.com',
      name: 'Firat',
      // password: `$2y$12$GBfcgD6XwaMferSOdYGiduw3Awuo95QAPhxFE0oNJ.Ds8qj3pzEZy`
      password,
    }
  })
  const client = await prisma.user.upsert({
    where: { username: 'client' },
    update: {},
    create: {
      username: 'client',
      email: 'client@demfirat.com',
      name: 'Client',
      // password: `$2y$12$GBfcgD6XwaMferSOdYGiduw3Awuo95QAPhxFE0oNJ.Ds8qj3pzEZy`
      password: await hash('1884', 12),
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


