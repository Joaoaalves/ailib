import { RxCross2, RxDividerHorizontal } from "react-icons/rx";

export default function WindowActions() {
    const handleMinimize = () => {
        if (window) window.actions.minimize();
    };

    const handleClose = () => {
        if (window) window.actions.close();
    };
    return (
        <div className="flex gap-x-3 items-center justify-center fixed  top-4 right-12">
            <button
                onClick={handleMinimize}
                className="bg-green-500 rounded-full group  p-0.5"
            >
                <RxDividerHorizontal className="text-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </button>
            <button
                onClick={handleClose}
                className="bg-red-500 rounded-full group p-0.5"
            >
                <RxCross2 className="text-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </button>
        </div>
    );
}
