import { PrismaClient } from '@prisma/client';
// import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// export async function GET(request: Request){
//   return new Response('hi')
// }

// export async function POST(request: Request){
//   return new Response('hi')
// }

export async function GET() {
  const data = {
    name: 'bishal',
    age: '27'
  }
  const fabrics = await prisma.collections.findFirst({
    where:{
      collection:'products_embroidered_sheer_curtain_fabrics',
    }
  })
  console.log(typeof(fabrics));
  // return NextResponse.json({ data })
  return new Response(JSON.stringify(fabrics))
}
