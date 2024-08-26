export default function Key({ children }) {
    return (
        <div className="border border-primary text-white rounded-[6px] w-8 h-8 flex items-center justify-center">
            <span className="text-white font-bold">{children}</span>
        </div>
    );
}
