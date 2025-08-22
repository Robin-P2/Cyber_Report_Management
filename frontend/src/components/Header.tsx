import { CircleUserRound } from "lucide-react";
import logo from "@/assets/logo.png";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface headerProps {
    title: string;
}

const Header = ({title}: headerProps) => {
    return (
        <header className="fixed top-0 left-0 w-full p-1 z-50 border-b border-b-neutral-200 bg-neutral-50">
            <div className="flex justify-between items-center text-black">
                <div className="flex items-center gap-3 pl-2">
                    {/* The <SidebarTrigger> component has only ONE direct child: the <button> */}
                    <SidebarTrigger className="hover:cursor-pointer transform scale-125 hover:text-blue-500"/>
                    <div className="flex items-center">
                        <a href="/">
                            <img src={logo} height="40px" width="100px" alt="logo" className="mt-1"/>
                        </a>
                    </div>
                    <h1 className="text-xl font-bold">{title}</h1>
                </div>
                <nav className="space-x-6">
                    <div>
                        <CircleUserRound size={32} />
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
