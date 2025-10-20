import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: {
        default: "Prompt2Site - AI Website Generator",
        template: "%s | Prompt2Site",
    },
    description:
        "Generate, edit and explore website designs with AI. Export code instantly with our powerful AI website generator.",
    keywords: [
        "AI website generator",
        "web design",
        "code generation",
        "prompt to website",
    ],
    authors: [{ name: "Prompt2Site" }],
    creator: "Prompt2Site",
    openGraph: {
        type: "website",
        locale: "en_US",
        title: "Prompt2Site - AI Website Generator",
        description: "Generate, edit and explore website designs with AI.",
        siteName: "Prompt2Site",
    },
    twitter: {
        card: "summary_large_image",
        title: "Prompt2Site - AI Website Generator",
        description: "Generate, edit and explore website designs with AI.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

const outfitFont = Outfit({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-outfit",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" className={outfitFont.variable}>
                <body className={outfitFont.className}>
                    <Provider>
                        {children}
                        <Toaster />
                    </Provider>
                </body>
            </html>
        </ClerkProvider>
    );
}
