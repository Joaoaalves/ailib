import Sidepanel from "./Sidepanel/Sidepanel";
import TopBar from "./TopBar/Topbar";

import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "./ui/ContextMenu";

import { ReactNode, useEffect, useState } from "react";
import WindowActions from "./WindowActions";
import { Comfortaa } from "next/font/google";
import { ScrollArea } from "./ui/ScrollArea";
import CommandDialog from "./ui/CommandDialog";
import { DocumentUploadProvider } from "@/contexts/DocumentUploadProvider";

const font = Comfortaa({
    subsets: ["latin"],
});

interface LayoutProps {
    children?: ReactNode;
    sidePanelLinks?: ReactNode;
}

export default function Layout({ children, sidePanelLinks }: LayoutProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <DocumentUploadProvider>
                    <main
                        className={`${font.className} grid grid-cols-[300px_1fr] grid-rows-[150px_1fr] w-screen h-screen gap-x-8 bg-background opacity-[0.99] shadow-custom-inset pe-8`}
                    >
                            <TopBar />
                        <Sidepanel>
                            {sidePanelLinks}
                        </Sidepanel>
                        <ScrollArea>
                            {children}
                        </ScrollArea>
                    </main>
                </DocumentUploadProvider>
                <CommandDialog open={open} setOpen={setOpen} />
                <WindowActions />
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-container text-white shadow-primary border-primary/30">
                <ContextMenuItem inset>
                    Back
                    <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset disabled>
                    Forward
                    <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset>
                    Reload
                    <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem checked>
                    Show Bookmarks Bar
                    <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
                </ContextMenuCheckboxItem>
                <ContextMenuCheckboxItem>
                    Show Full URLs
                </ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuRadioGroup value="pedro">
                    <ContextMenuLabel inset className="text-white underline">
                        People
                    </ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ContextMenuRadioItem value="pedro">
                        Pedro Duarte
                    </ContextMenuRadioItem>
                    <ContextMenuRadioItem value="colm">
                        Colm Tuite
                    </ContextMenuRadioItem>
                </ContextMenuRadioGroup>
            </ContextMenuContent>
        </ContextMenu>
    );
}
