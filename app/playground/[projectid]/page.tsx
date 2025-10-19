"use client";
import React from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import ElementSettingsSection from "../_components/ElementSettingsSection";
import { useParams, useSearchParams } from "next/navigation";

function Playground() {
    const {projectid} = useParams();
    const params = useSearchParams();
    const frameId = params.get("frame");
    console.log("Project ID:", projectid, "Frame ID:", frameId);
    return (
        <div>
            <PlaygroundHeader />

            <div className="flex">
                {/* Chats Section */}
                <ChatSection />

                {/* WebsiteDesign Section */}
                <WebsiteDesign />

                {/* Settings Section */}
                {false && <ElementSettingsSection />}
            </div>
        </div>
    );
}

export default Playground;
