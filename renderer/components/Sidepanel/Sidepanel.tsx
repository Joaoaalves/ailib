import { VscLibrary } from "react-icons/vsc";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";

import NavLink from "./NavLink";
import Nav from "./Nav";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import Settings from "./Settings";

interface SidepanelProps {
    children?: ReactNode;
}

export default function Sidepanel({ children }: SidepanelProps) {
    const router = useRouter();
    return (
        <aside className="bg-container place-items-center row-span-2 row-start-1 flex flex-col">
            <h1
                onClick={() => router.push("/home")}
                className="text-white font-bold text-2xl mt-2 py-5 border-b-2 w-full text-center border-neutral-700 cursor-pointer"
            >
                AI<b className="text-primary">Lib</b>
            </h1>
            {children ? (
                children
            ) : (
                <Nav>
                    <NavLink
                        href="/home"
                        label="Documents"
                        router={router}
                        Icon={<HiOutlineDocumentDuplicate />}
                    />
                    <NavLink
                        href="/collections"
                        label="Collections"
                        router={router}
                        Icon={<VscLibrary />}
                    />
                </Nav>
            )}

            <Settings />
        </aside>
    );
}
