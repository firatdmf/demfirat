import { PrismaClient } from "@prisma/client";

// global instance for our database connection
// check the global object to see if it has prisma already if it does, we use that global prisma object. 
// If it doesn't we will create it 
const globalForPrisma = global as unknown as {prisma:PrismaClient}

export const prisma =
globalForPrisma.prisma || new PrismaClient({
    // If you want to print every query uncomment below
    // log:['query']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma 

// since we are exporting this, this will only be executed once. After that we will reuse that same prisma client
