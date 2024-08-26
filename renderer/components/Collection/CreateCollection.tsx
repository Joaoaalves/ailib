import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/Dialog";
import CreateCollectionForm from "./CreateCollectionForm";

export default function CreateCollection() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="bg-container my-4 rounded-xl text-white font-bold transition-all duration-300 hover:bg-black">
                    Create Collection
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-container border-none">
                <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                <CreateCollectionForm />
            </DialogContent>
        </Dialog>
    );
}
