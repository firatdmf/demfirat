import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
// import { authOptions } from "./auth/[...nextauth]/route";
import { authOptions } from '@/utils/authOptions'

export async function GET(request:Request){
    const session = await getServerSession(authOptions)

    // this is how you can handle errors yourself for api and send status to browser network
    if(!session){
        return new NextResponse(JSON.stringify({error:'unauthorized'}),{
            status:401
        })
    }

    // console.log('GET API', session)
    return NextResponse.json({authenticated: !!session})
}