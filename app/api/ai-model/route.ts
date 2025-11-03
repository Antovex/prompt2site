import { NextRequest, NextResponse } from "next/server";

// Robust SSE proxy to OpenRouter with chunk-safe parsing and single-close semantics
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return NextResponse.json(
                { error: "Invalid payload: 'messages' must be a non-empty array" },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server misconfigured: missing OPENROUTER_API_KEY" },
                { status: 500 }
            );
        }

        const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
        const model = process.env.OPENROUTER_MODEL || "minimax/minimax-m2:free";
        const referer = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";

        const upstream = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": referer,
                "X-Title": "prompt2site",
            },
            body: JSON.stringify({ model, messages, stream: true }),
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => "");
            // Forward upstream error for easier debugging
            return new NextResponse(text || "Upstream error", { status: upstream.status });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const readable = new ReadableStream<Uint8Array>({
            start(controller) {
                let closed = false;
                let buffer = "";

                const safeClose = () => {
                    if (!closed) {
                        closed = true;
                        try {
                            controller.close();
                        } catch {}
                    }
                };

                const reader = upstream.body?.getReader();
                if (!reader) {
                    safeClose();
                    return;
                }

                const read = (): any =>
                    reader
                        .read()
                        .then(({ done, value }) => {
                            if (done) {
                                safeClose();
                                return;
                            }
                            const chunk = decoder.decode(value, { stream: true });
                            buffer += chunk;

                            // Split by SSE event boundary (blank line)
                            const events = buffer.split("\n\n");
                            buffer = events.pop() || ""; // keep last partial

                            for (const evt of events) {
                                const lines = evt.split("\n");
                                for (const line of lines) {
                                    if (!line.startsWith("data:")) continue;
                                    const dataStr = line.slice(5).trim(); // after 'data:'
                                    if (dataStr === "[DONE]") {
                                        safeClose();
                                        return;
                                    }
                                    try {
                                        const json = JSON.parse(dataStr);
                                        const text: string | undefined = json?.choices?.[0]?.delta?.content;
                                        if (text && !closed) {
                                            controller.enqueue(encoder.encode(text));
                                        }
                                    } catch (e) {
                                        // If a full event still fails to parse, log and continue.
                                        console.error("SSE JSON parse error:", e);
                                    }
                                }
                            }
                            return read();
                        })
                        .catch((err) => {
                            console.error("Stream read error:", err);
                            try {
                                controller.error(err);
                            } catch {}
                            safeClose();
                        });

                read();
            },
        });

        return new NextResponse(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
