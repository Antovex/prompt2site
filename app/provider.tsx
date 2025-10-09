"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailsContext";

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

    const CreateNewUser = async () => {
        try {
            const result = await axios.post("/api/users", {});
            // console.log(result.data);
            setUserDetail(result.data?.user);
        } catch (error) {
            console.error("Error creating/fetching user:", error);
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
