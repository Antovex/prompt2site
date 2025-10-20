"use client";
import React, { useEffect, useState } from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import ElementSettingsSection from "../_components/ElementSettingsSection";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

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
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        frameId && GetFrameDetails();
    }, [frameId]);

    const GetFrameDetails = async () => {
        try {
            setLoading(true);
            const result = await axios.get(
                "/api/frames?frameId=" + frameId + "&projectId=" + projectid
            );
            console.log("Frame Details: ", result.data);
            setFrameDetails(result.data);
        } catch (error: any) {
            console.error("Error fetching frame details:", error);
            
            // Handle different error scenarios
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 404) {
                    toast.error("Frame not found", {
                        description: "The requested frame does not exist in the database.",
                        action: {
                            label: "Go to Workspace",
                            onClick: () => router.push("/workspace"),
                        },
                    });
                } else if (error.response.status === 400) {
                    toast.error("Invalid request", {
                        description: "Missing required parameters.",
                    });
                } else {
                    toast.error("Error loading frame", {
                        description: error.response.data?.error || "Something went wrong while loading the frame.",
                    });
                }
            } else if (error.request) {
                // The request was made but no response was received
                toast.error("Network error", {
                    description: "Unable to connect to the server. Please check your internet connection.",
                });
            } else {
                // Something happened in setting up the request that triggered an Error
                toast.error("Error", {
                    description: "An unexpected error occurred.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PlaygroundHeader />

            {loading ? (
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading frame details...</p>
                    </div>
                </div>
            ) : (
                <div className="flex">
                    {/* Chats Section */}
                    <ChatSection messages={frameDetails?.chatMessages ?? []} />

                    {/* WebsiteDesign Section */}
                    <WebsiteDesign />

                    {/* Settings Section */}
                    {false && <ElementSettingsSection />}
                </div>
            )}
        </div>
    );
}

export default Playground;
