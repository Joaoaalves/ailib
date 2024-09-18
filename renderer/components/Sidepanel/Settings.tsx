import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/Dialog";
import { CiSettings } from "react-icons/ci";
import SettingsForm from "./SettingsForm";

export default function Settings({}) {
    const [open, setOpen] = useState<boolean>();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="mt-auto border-t-2 border-neutral-700 w-full py-4 group cursor-pointer hover:bg-neutral-900 transition-all duration-300">
                    <span className="text-xl text-white font-bold flex gap-x-2 items-center justify-center group-hover:text-primary transition-all duration-300">
                        <CiSettings />
                        Settings
                    </span>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-container border-none">
                <DialogHeader>
                    <DialogTitle className="text-white text-center">
                        Settings
                    </DialogTitle>
                </DialogHeader>
                <SettingsForm setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    );
}
