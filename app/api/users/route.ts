import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));
        
        // If user doesn't exist, create new user
        const data = {
            name: user?.fullName ?? 'NA',
            email: user.primaryEmailAddress.emailAddress,
            credits: 2,
        }
        if (existingUser?.length === 0) {
            const result = await db.insert(usersTable).values({
                ...data
            });
            
            // console.log('New user created:', result);
            return NextResponse.json({ 
                message: "User created successfully", 
                user: result 
            });
        }

        return NextResponse.json({ 
            message: "User already exists", 
            user: existingUser[0] 
        });
        
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ 
            error: "Failed to create user" 
        }, { status: 500 });
    }
}