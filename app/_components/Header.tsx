import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";

const MenuOptions = [
    {
        name: "Pricing",
        path: "/pricing",
    },
    {
        name: "Contact us",
        path: "/contact-us",
    },
];

function Header() {
    return (
        <div className="relative flex items-center justify-between p-4 shadow">
            {/* Logo */}
            <div className="flex gap-2 items-center">
                <Image src={"/logo.svg"} alt="logo" width={35} height={35} />
                <h2>
                    <span className="font-bold text-xl">Prompt2Site</span>
                    <span className="text-xl"> - AI Website Generator</span>
                </h2>
            </div>
            {/* Centered Menu Options */}
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-3">
                {MenuOptions.map((menu, index) => (
                    <Button variant="ghost" key={index}>
                        {menu.name}
                    </Button>
                ))}
            </div>
            {/* Getting started Button */}
            <div>
                <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
                    <Button>
                        Get Started <ArrowRight />
                    </Button>
                </SignInButton>
            </div>
        </div>
    );
}

export default Header;
