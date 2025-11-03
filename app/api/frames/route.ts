import { db } from "@/config/db";
import { chatTable, frameTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const frameId = searchParams.get("frameId");
        const projectId = searchParams.get("projectId");

        // Validate query parameters
        if (!frameId || !projectId) {
            return NextResponse.json(
                { error: "Missing frameId or projectId" },
                { status: 400 }
            );
        }

        const frameResult = await db
            .select()
            .from(frameTable)
            .where(
                and(
                    //@ts-ignore
                    eq(frameTable.frameId, frameId),
                    //@ts-ignore
                    eq(frameTable.projectId, projectId)
                )
            );

        // Check if frame exists
        if (!frameResult || frameResult.length === 0) {
            return NextResponse.json(
                { error: "Frame not found" },
                { status: 404 }
            );
        }

        const chatResult = await db.select().from(chatTable).where(
            //@ts-ignore
            eq(chatTable.frameId, frameId)
        );

        // Check if chat exists
        if (!chatResult || chatResult.length === 0) {
            return NextResponse.json(
                { error: "Chat messages not found for this frame" },
                { status: 404 }
            );
        }

        const finalResult = {
            ...frameResult[0],
            chatMessages: chatResult[0].chatMessages || [],
        };

        return NextResponse.json(finalResult);
    } catch (error) {
        console.error("Error fetching frame details:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
