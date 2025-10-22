"use client";
import React, { useEffect, useState } from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import ElementSettingsSection from "../_components/ElementSettingsSection";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type FrameType = {
    projectId: string;
    frameId: string;
    designCode: string;
    chatMessages: MessagesType[];
};

export type MessagesType = {
    role: string;
    content: string;
};

const Prompt = `userInput: {userInput}

Instructions:

1. If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:

   - Generate a complete HTML Tailwind CSS code using Flowbite UI components.  
   - Use a modern design with **blue as the primary color theme**.  
   - Only include the <body> content (do not add <head> or <title>).  
   - Make it fully responsive for all screen sizes.  
   - All primary components must match the theme color.  
   - Add proper padding and margin for each element.  
   - Components should be independent; do not connect them.  
   - Use placeholders for all images:  
       - Light mode: https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg
       - Dark mode: https://www.cibaky.com/wp-content/uploads/2015/12/placeholder-3.jpg
       - Add alt tag describing the image prompt.  
   - Use the following libraries/components where appropriate:  
       - FontAwesome icons (fa fa-)  
       - Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, dropdowns, accordions, etc.  
       - Chart.js for charts & graphs  
       - Swiper.js for sliders/carousels  
       - Tippy.js for tooltips & popovers  
   - Include interactive components like modals, dropdowns, and accordions.  
   - Ensure proper spacing, alignment, hierarchy, and theme consistency.  
   - Ensure charts are visually appealing and match the theme color.  
   - Header menu options should be spread out and not connected.  
   - Do not include broken links.  
   - Do not add any extra text before or after the HTML code.  

2. If the user input is **general text or greetings** (e.g., "Hi", "Hello", "How are you?") **or does not explicitly ask to generate code**, then:

   - Respond with a simple, friendly text message instead of generating any code.  

Example:

- User: "Hi" → Response: "Hello! How can I help you today?"  
- User: "Build a responsive landing page with Tailwind CSS" → Response: [Generate full HTML code as per instructions above]
`;

function Playground() {
    const { projectid } = useParams();
    const params = useSearchParams();
    const frameId = params.get("frame");
    const [frameDetails, setFrameDetails] = useState<FrameType>();
        const [frameLoading, setFrameLoading] = useState(false);
        const [sending, setSending] = useState(false);
    const router = useRouter();
    const [messages, setMessages] = useState<MessagesType[]>([]);
    const [generatedCode, setGeneratedCode] = useState<string>("");

    useEffect(() => {
        if (frameId && projectid) {
            GetFrameDetails();
        }
    }, [frameId, projectid]);

    const GetFrameDetails = async () => {
        try {
            setFrameLoading(true);
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
                        description:
                            "The requested frame does not exist in the database.",
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
                        description:
                            error.response.data?.error ||
                            "Something went wrong while loading the frame.",
                    });
                }
            } else if (error.request) {
                // The request was made but no response was received
                toast.error("Network error", {
                    description:
                        "Unable to connect to the server. Please check your internet connection.",
                });
            } else {
                // Something happened in setting up the request that triggered an Error
                toast.error("Error", {
                    description: "An unexpected error occurred.",
                });
            }
        } finally {
            setFrameLoading(false);
        }
    };

    // Seed local chat state with frame messages when they load
    useEffect(() => {
        if (frameDetails?.chatMessages) {
            setMessages(frameDetails.chatMessages);
        }
    }, [frameDetails]);

    const SendMessage = async (userInput: string) => {
        if (!userInput?.trim()) {
            toast.error("Please enter a message");
            return;
        }

    setSending(true);

        try {
            setMessages((prev: MessagesType[]) => [
                ...(prev ?? []),
                { role: "user", content: userInput },
            ]);

            const result = await fetch("/api/ai-model", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        ...messages,
                        {
                            role: "user",
                            content: Prompt.replace("{userInput}", userInput),
                        },
                    ],
                }),
            }); //Need to insert Prompt also

            // Handle non-2xx responses early (e.g., 403 moderation blocks)
            if (!result.ok) {
                let bodyText = "";
                try {
                    bodyText = await result.text();
                    const json = JSON.parse(bodyText);
                    const reasons = json?.error?.metadata?.reasons?.join(", ");
                    const msg = json?.error?.message || json?.error || bodyText;
                    toast.error("Model blocked the request", {
                        description:
                            (reasons
                                ? `${msg} (reason: ${reasons})`
                                : msg) ||
                            "Your prompt was flagged by the model's safety filters. Try rephrasing or pick a different model.",
                    });
                } catch (e) {
                    toast.error("Request failed", {
                        description:
                            bodyText ||
                            `Upstream error (status ${result.status}). Please try again.`,
                    });
                }
                return; // Do not proceed to stream when the response isn't OK
            }

            const reader = result.body?.getReader();
            const decoder = new TextDecoder();

            let aiResponse = "";
            let isCode = false;

            while (true) {
                const { done, value } = (await reader?.read()) as any;
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;

                //Check if AI is sending code
                if (!isCode && aiResponse.includes("```html")) {
                    isCode = true;
                    const index = aiResponse.indexOf("```html") + 7;
                    const initialCodeChunk = aiResponse.slice(index);
                    // reset generated code when code block starts
                    setGeneratedCode("");
                    setGeneratedCode((prev: string) => prev + initialCodeChunk);
                } else if (isCode) {
                    setGeneratedCode((prev: string) => prev + chunk);
                }
            }

            if (!isCode) {
                setMessages((prev: any) => [
                    ...prev,
                    { role: "assistant", content: aiResponse },
                ]);
            } else {
                setMessages((prev: any) => [
                    ...prev,
                    { role: "assistant", content: "Your Code is ready!" },
                ]);
            }
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message", {
                description:
                    error.response?.data?.error ||
                    "An error occurred while sending your message.",
            });
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        console.log("Generated Code: ", generatedCode);
    }, [generatedCode]);
    return (
        <div>
            <PlaygroundHeader />

            {frameLoading ? (
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading frame details...</p>
                    </div>
                </div>
            ) : !frameDetails ? (
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="text-center space-y-3">
                        <p className="text-muted-foreground">No frame data available.</p>
                        <Button variant="outline" onClick={() => router.push("/workspace")}>Go to Workspace</Button>
                    </div>
                </div>
            ) : (
                <div className="flex">
                    {/* Chats Section */}
                    <ChatSection
                            messages={messages ?? []}
                            onSend={(input: string) => SendMessage(input)}
                            disabled={sending}
                    />

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
