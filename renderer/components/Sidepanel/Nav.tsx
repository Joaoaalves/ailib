import { ReactNode } from "react";
import { ScrollArea } from "../ui/ScrollArea";
interface NavProps {
    children: ReactNode;
}

export default function Nav({ children }: NavProps) {
    return (
        <ScrollArea className="w-full col-span-1">
            <nav>
                <ul className="w-full flex flex-col items-center justify-center gap-y-4 py-8">
                    {children}
                </ul>
            </nav>
        </ScrollArea>
    );
}
