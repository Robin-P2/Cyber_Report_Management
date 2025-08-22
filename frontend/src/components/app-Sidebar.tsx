import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarGroupContent,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarFooter,
} from "@/components/ui/sidebar";
import {
    FolderPlus,
    FolderPen,
    FileUser,
    Settings,
    LogOut,
    ChartLine,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
export function AppSidebar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent className="pt-5">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className="hover:text-blue-500 hover:cursor-pointer"
                                >
                                    <Link to="/">
                                        <ChartLine />
                                        <span className="text-black hover:text-black">
                                            Dashboard
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarSeparator className="my-1" />
                            {user && user.role.toLowerCase() === "admin" ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className="hover:text-blue-500 hover:cursor-pointer"
                                        >
                                            <Link to="/self-evaluation">
                                                <FolderPen />
                                                <span className="text-black hover:text-black">
                                                    Self Evaluation
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            ) : (
                                <></>
                            )}
                            {user && user.role.toLowerCase() === "admin" ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className="hover:text-blue-500 hover:cursor-pointer"
                                        >
                                            <Link to="/upload">
                                                <FolderPlus />
                                                <span className="text-black hover:text-black">
                                                    Add Organization
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            ) : (
                                <></>
                            )}
                            {user && user.role.toLowerCase() === "admin" ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className="hover:text-blue-500 hover:cursor-pointer"
                                        >
                                            <Link to="/manage-companies">
                                                <FolderPen />
                                                <span className="text-black hover:text-black">
                                                    Edit Organization
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarSeparator className="my-1" />
                                </>
                            ) : (
                                <></>
                            )}
                            {user && user.role.toLowerCase() === "admin" ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className="hover:text-blue-500 hover:cursor-pointer"
                                        >
                                            <Link to="/manage-users">
                                                <FileUser />
                                                <span className="text-black hover:text-black">
                                                    User Management
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            ) : (
                                <></>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu className="pb-2">
                    <SidebarSeparator />
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="hover:text-blue-500 hover:cursor-pointer"
                        >
                            <a href="#">
                                <Settings />
                                <span className="text-black hover:text-black">
                                    Settings
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="hover:text-red-600 hover:cursor-pointer"
                            onClick={handleLogout}
                        >
                            <div>
                                <LogOut />
                                <span className="text-black hover:text-black">
                                    Log Out
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
