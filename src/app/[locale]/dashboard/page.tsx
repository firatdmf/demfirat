// This is a sample page to show page protection (only accessible via authentication)


// below is client side protection, but as you could see, there is latency
// ----------------------
// 'use client'


// import { useSession } from "next-auth/react";

// export default function Dashboard() {
//     const {status}= useSession({
//         required:true,
//         onUnauthenticated(){
//             // the user not authenticated, handle here
//             console.log('Not logged in!');
            
//         }
//     })
//     if(status=== "loading"){
//         return 'loading or unautheticated'
//     }
//   return <>Super Secret Page</>;
// }
// just a mock change ignore this line



// Now let's do server side protection (this is much much faster)
// --------------------------------------------
import { getServerSession } from "next-auth";
// import { authOptions } from "../../api/auth/[...nextauth]/route";
import { authOptions } from '@/utils/authOptions'
import { redirect } from "next/navigation";
export default async function Dashboard() {
    const session = await getServerSession(authOptions)
    if(!session){
        redirect('/api/auth/signin')
        
    }
  return <>Super Secret Page</>;
}
