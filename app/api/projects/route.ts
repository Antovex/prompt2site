import { db } from "@/config/db";
import { chatTable, frameTable, projectTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { projectId, frameId, messages } = await req.json();

    const user = await currentUser();
    if (!user) {
        return new Response("No user details found to make a project", {
            status: 401,
        });
    }

    //Create project
    const projectResult = await db
        .insert(projectTable)
        .values({
            projectId: projectId,
            createdBy: user?.primaryEmailAddress?.emailAddress,
        })

    //Create frame
    const frameResult = await db
        .insert(frameTable)
        .values({
            frameId: frameId,
            projectId: projectId,
        })

    //Save user messages
    const chatResult = await db
        .insert(chatTable)
        .values({
            frameId: frameId,
            chatMessages: messages,
            createdBy: user?.primaryEmailAddress?.emailAddress,
        })

    return NextResponse.json({ projectResult, frameResult, chatResult });
}
