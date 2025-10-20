"use client";
import React, { useEffect, useState } from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import ElementSettingsSection from "../_components/ElementSettingsSection";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

export type FrameType = {
    projectId: string,
    frameId: string,
    designCode: string,
    chatMessages: MessagesType[],
}

export type MessagesType = {
    role: string,
    content: string,
}

function Playground() {
    const { projectid } = useParams();
    const params = useSearchParams();
    const frameId = params.get("frame");
    const [frameDetails, setFrameDetails] = useState<FrameType>();

    useEffect(() => {
        frameId && GetFrameDetails();
    }, [frameId]);

    const GetFrameDetails = async () => {
        const result = await axios.get(
            "/api/frames?frameId=" + frameId + "&projectId=" + projectid
        );
        console.log("Frame Details: ", result.data);
        setFrameDetails(result.data);
    };

    return (
        <div>
            <PlaygroundHeader />

            <div className="flex">
                {/* Chats Section */}
                <ChatSection messages={frameDetails?.chatMessages??[]}/>

                {/* WebsiteDesign Section */}
                <WebsiteDesign />

                {/* Settings Section */}
                {false && <ElementSettingsSection />}
            </div>
        </div>
    );
}

export default Playground;
