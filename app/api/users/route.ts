import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "User email not found. Please ensure your account has a verified email address." },
                { status: 400 }
            );
        }

        const userEmail = user.primaryEmailAddress.emailAddress;

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, userEmail));
        
        // If user already exists, return existing user
        if (existingUser?.length > 0) {
            return NextResponse.json({ 
                message: "User already exists", 
                user: existingUser[0] 
            });
        }

        // Create new user
        const data = {
            name: user?.fullName ?? 'User',
            email: userEmail,
            credits: 2,
        };

        const result = await db
            .insert(usersTable)
            .values(data)
            .returning();
        
        if (!result || result.length === 0) {
            throw new Error("Failed to create user record");
        }

        return NextResponse.json({ 
            message: "User created successfully", 
            user: result[0] 
        });
        
    } catch (error: any) {
        console.error('Error creating/fetching user:', error);

        // Handle database constraint errors
        if (error.code === "23505") {
            // Unique constraint violation - user might already exist
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json({ 
            error: "Failed to create or fetch user. Please try again." 
        }, { status: 500 });
    }
}