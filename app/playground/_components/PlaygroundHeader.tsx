"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

function PlaygroundHeader() {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            // TODO: Implement save functionality
            // await axios.post('/api/save-design', { ... });
            
            toast.info("Save functionality coming soon!", {
                description: "This feature is under development.",
            });
        } catch (error: any) {
            console.error("Error saving design:", error);
            toast.error("Failed to save", {
                description: error.response?.data?.error || "An error occurred while saving.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 shadow">
            <Image src={"/logo.svg"} alt="logo" width={35} height={35} />
            <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                    <>
                        <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                        Saving...
                    </>
                ) : (
                    "Save"
                )}
            </Button>
        </div>
    );
}

export default PlaygroundHeader;
