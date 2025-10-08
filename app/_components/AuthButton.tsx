"use client";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AuthButton() {
    const { user } = useUser();
    if (!user) {
        return (
            <SignInButton mode="modal" forceRedirectUrl={"/workspace"}>
                <Button>
                    Get Started <ArrowRight />
                </Button>
            </SignInButton>
        );
    }
    return (
        <Link href={"/workspace"}>
            <Button>
                Get Started <ArrowRight />
            </Button>
        </Link>
    );
}