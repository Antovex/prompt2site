"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailsContext";
import { toast } from "sonner";

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useUser();
    useEffect(() => {
        user && CreateNewUser();
    }, [user]);

    const [userDetail, setUserDetail] = useState<any>();
    const [userLoadError, setUserLoadError] = useState(false);

    const CreateNewUser = async () => {
        try {
            const result = await axios.post("/api/users", {});
            
            if (result.data?.user) {
                setUserDetail(result.data.user);
                setUserLoadError(false);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error: any) {
            console.error("Error creating/fetching user:", error);
            setUserLoadError(true);

            // Handle different error scenarios
            if (error.response) {
                const status = error.response.status;
                const errorMessage = error.response.data?.error;

                if (status === 400) {
                    toast.error("User profile error", {
                        description: errorMessage || "Unable to access user email. Please check your account settings.",
                        duration: 5000,
                    });
                } else if (status === 500) {
                    toast.error("Server error", {
                        description: "Failed to load user profile. Some features may not work correctly.",
                        duration: 5000,
                    });
                } else {
                    toast.error("Error loading profile", {
                        description: errorMessage || "An unexpected error occurred while loading your profile.",
                        duration: 5000,
                    });
                }
            } else if (error.request) {
                toast.error("Network error", {
                    description: "Unable to connect to the server. Please check your internet connection.",
                    duration: 5000,
                });
            } else {
                toast.error("Error", {
                    description: "An unexpected error occurred. Please refresh the page.",
                    duration: 5000,
                });
            }
        }
    };

    return (
        <div>
            <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
                {children}
            </UserDetailContext.Provider>
        </div>
    );
}

export default Provider;
