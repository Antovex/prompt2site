import { db } from "@/config/db";
import { chatTable, frameTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const frameId = searchParams.get("frameId");
    const projectId = searchParams.get("projectId");

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

    console.log("Frame Result: ", frameResult);

    const chatResult = await db.select().from(chatTable).where(
        //@ts-ignore
        eq(chatTable.frameId, frameId)
    );

    console.log("Chat Result: ", chatResult);

    const finalResult = {
        ...frameResult[0],
        chatMessages: chatResult[0]?.chatMessages || [],
    };

    return NextResponse.json(finalResult);
}
