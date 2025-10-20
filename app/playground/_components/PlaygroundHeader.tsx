import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

function PlaygroundHeader() {
    return (
        <div className="flex items-center justify-between p-4 shadow">
            <Image src={"/logo.svg"} alt="logo" width={35} height={35} />
            <Button>Save</Button>
        </div>
    );
}

export default PlaygroundHeader;
