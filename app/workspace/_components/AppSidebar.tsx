"use client";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { UserDetailContext } from "@/context/UserDetailsContext";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";

export function AppSidebar() {
    const [projectList, setProjectList] = useState([]);
    const {userDetail, setUserDetail} = useContext(UserDetailContext);
    // console.log(userDetail);
    return (
        <Sidebar>
            <SidebarHeader className="p-5">
                <div className="flex items-center gap-2">
                    <Image
                        src={"/logo.svg"}
                        alt="logo"
                        width={35}
                        height={35}
                    />
                    <h2 className="font-bold text-xl">Prompt2Site</h2>
                </div>
                <Link href={"/workspace"} className="mt-5 w-full">
                    <Button className="w-full">+ Add New Project</Button>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Projects</SidebarGroupLabel>
                    {projectList.length == 0 && (
                        <h2 className="text-sm px-2 text-gray-500">
                            No Project found
                        </h2>
                    )}
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
                <div>
                    <h2>
                        Remaining Credits:{" "}
                        <span className="font-bold">{userDetail?.credits ?? 0}</span>
                    </h2>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
