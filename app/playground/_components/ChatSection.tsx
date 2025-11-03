import { useState } from "react";
import { MessagesType } from "../[projectid]/page";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

type Props = {
    messages: MessagesType[];
    onSend: (input: string) => void | Promise<void>;
    disabled?: boolean;
    loading: boolean;
};

function ChatSection({ messages, onSend, disabled, loading }: Props) {
    const [input, setInput] = useState<string>();

    const handleSend = async () => {
        if (!input?.trim() || disabled) {
            return;
        }

        try {
            await onSend(input);
            setInput("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="w-96 shadow h-[91vh] p-4 flex flex-col">
            {/* Message section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                {messages?.length === 0 ? (
                    <p className="text-gray-400 text-center">No Messages Yet</p>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`p-2 rounded-lg max-w-[80%] ${
                                    message.role === "user"
                                        ? "bg-gray-100 text-black"
                                        : "bg-gray-300 text-black"
                                }`}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-800">
                        </div>
                            <span className="ml-2 text-zinc-800">
                                Working on your request...
                            </span>
                    </div>
                )}
            </div>

            {/* Footer section */}
            <div className="p-3 border-t flex items-center gap-2">
                <textarea
                    value={input}
                    placeholder="Describe your website idea..."
                    className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    onChange={(event) => setInput(event.target.value)}
                    disabled={disabled}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button onClick={handleSend} disabled={!input?.trim() || !!disabled}>
                    {" "}
                    <ArrowUp />{" "}
                </Button>
            </div>
        </div>
    );
}

export default ChatSection;
