"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { UserDetailContext } from "@/context/UserDetailsContext";
import { UserButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export function AppSidebar() {
    const [projectList, setProjectList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { userDetail, setUserDetail } = useContext(UserDetailContext);

    useEffect(() => {
        // TODO: Implement project fetching when API endpoint is ready
        // userDetail && GetUserProjects();
    }, [userDetail]);

    const GetUserProjects = async () => {
        try {
            setLoading(true);
            // TODO: Create /api/projects GET endpoint to fetch user's projects
            // const result = await axios.get('/api/projects');
            // setProjectList(result.data.projects);
        } catch (error: any) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to load projects", {
                description: error.response?.data?.error || "Unable to load your projects.",
            });
        } finally {
            setLoading(false);
        }
    };

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
                    {loading ? (
                        <p className="text-sm px-2 text-gray-500">Loading projects...</p>
                    ) : projectList.length === 0 ? (
                        <h2 className="text-sm px-2 text-gray-500">
                            No Project found
                        </h2>
                    ) : (
                        projectList.map((project: any, index) => (
                            <div key={index} className="px-2 py-1">
                                {/* TODO: Add project list item component */}
                                {project.name}
                            </div>
                        ))
                    )}
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter className="p-2">
                <div className="p-3 border rounded-xl space-y-3 bg-secondary">
                    <h2>
                        {" "}
                        {/* className="flex justify-between items-center" */}
                        Remaining Credits:{" "}
                        <span className="font-bold">
                            {userDetail?.credits ?? 0}
                        </span>
                    </h2>
                    <Progress value={33} />
                    <Button className="w-full">Upgrade to Unlimited</Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <UserButton />
                        <Button
                            variant={'outline'}
                            className="flex item-center"
                        >
                            <Settings />
                            Settings
                        </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
