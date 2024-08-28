import { ReactNode } from "react";

interface InputGroupProps {
    children: ReactNode;
}

export default function InputGroup({ children }: InputGroupProps) {
    return <div className="space-y-4">{children}</div>;
}
