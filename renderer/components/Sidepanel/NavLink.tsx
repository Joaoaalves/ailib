import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReactNode } from "react";
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
} from "../ui/ContextMenu";

interface Action {
    label: string,
    shortcut: string,
    onClick: Function
}

interface NavLinkProps {
    href: string;
    label: string;
    Icon: ReactNode;
    router: AppRouterInstance;
    Actions?: Action[];
}

export default function NavLink({ href, label, Icon, router, Actions }: NavLinkProps) {
    const handleNavigate = () => {
        router.push(href);
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
        <li
            onClick={handleNavigate}
            className="w-full text-center hover:bg-black transition-all duration-300 py-2 cursor-pointer text-white font-black text-xl grid grid-cols-[18px_1fr_18px] gap-x-2"
        >
            {Icon}
            <span className="line-clamp-1 text-sm">
                {label}
            </span>
        </li>
        </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-container text-white shadow-primary border-primary/30">
                {Actions && Actions.map(action => (
                    <ContextMenuItem inset onClick={() => action.onClick()}>
                        {action.label}
                        <ContextMenuShortcut>{action.shortcut}</ContextMenuShortcut>
                    </ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    );
}
