import { prisma } from "@/lib/prisma";

export default async function Example() {
  const user = await prisma.collections.findFirst({
    where:{
      id:1
    }
  })
  return <div>
    Hello, {user?.collection}
  </div>;
}
