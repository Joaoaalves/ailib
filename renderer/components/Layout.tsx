import Sidepanel from "./Sidepanel/Sidepanel";
import TopBar from "./TopBar/Topbar";

import { SearchProvider } from "@/contexts/SearchContext";

import MainCommands from "./Commands/MainCommands";

import { ReactNode } from "react";
import WindowActions from "./WindowActions";
import { Comfortaa } from "next/font/google";

import { DocumentUploadProvider } from "@/contexts/DocumentUploadProvider";
import PageContent from "./PageContent";

const font = Comfortaa({
    subsets: ["latin"],
});

interface LayoutProps {
    children?: ReactNode;
    sidePanelLinks?: ReactNode;
}

export default function Layout({ children, sidePanelLinks }: LayoutProps) {
    return (
        <MainCommands>
            <main
                className={`${font.className} grid grid-cols-[300px_1fr] grid-rows-[150px_1fr] w-screen h-screen gap-x-8 bg-background opacity-[0.99] shadow-custom-inset pe-8`}
            >
                <SearchProvider>
                    <DocumentUploadProvider>
                        <TopBar />
                        <Sidepanel>{sidePanelLinks}</Sidepanel>
                        <PageContent>{children}</PageContent>
                    </DocumentUploadProvider>
                    <WindowActions />
                </SearchProvider>
            </main>
        </MainCommands>
    );
}
