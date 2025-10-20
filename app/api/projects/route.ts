import { db } from "@/config/db";
import { chatTable, frameTable, projectTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId, frameId, messages } = body;

        // Validate required fields
        if (!projectId || !frameId || !messages) {
            return NextResponse.json(
                { error: "Missing required fields: projectId, frameId, or messages" },
                { status: 400 }
            );
        }

        // Validate messages array
        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages must be a non-empty array" },
                { status: 400 }
            );
        }

        const user = await currentUser();
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "No user details found to create a project" },
                { status: 401 }
            );
        }

        // Create project
        const projectResult = await db
            .insert(projectTable)
            .values({
                projectId: projectId,
                createdBy: user.primaryEmailAddress.emailAddress,
            })
            .returning();

        // Create frame
        const frameResult = await db
            .insert(frameTable)
            .values({
                frameId: frameId,
                projectId: projectId,
            })
            .returning();

        // Save user messages (with frameId reference)
        const chatResult = await db
            .insert(chatTable)
            .values({
                chatMessages: messages,
                frameId: frameId,
                createdBy: user.primaryEmailAddress.emailAddress,
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: {
                project: projectResult[0],
                frame: frameResult[0],
                chat: chatResult[0],
            },
        });
    } catch (error: any) {
        console.error("Error creating project:", error);

        // Handle database constraint errors
        if (error.code === "23505") {
            // Unique constraint violation
            return NextResponse.json(
                { error: "Project with this ID already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create project. Please try again." },
            { status: 500 }
        );
    }
}
