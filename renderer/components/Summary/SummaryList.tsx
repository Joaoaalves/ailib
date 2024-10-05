import Nav from "@/components/Sidepanel/Nav";
import NavLink from "../Sidepanel/NavLink";
import { ISummary } from "shared/types/summary";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BsJournalText } from "react-icons/bs";

export default function SummaryList({ documentId }) {
    const [summaries, setSummaries] = useState<ISummary[]>();
    const router = useRouter();
    const getSummaries = async () => {
        const summaries = await window.api.summary.getAll();

        setSummaries(summaries);
    };

    useEffect(() => {
        getSummaries();
    }, []);

    return (
        <Nav>
            {summaries?.length &&
                summaries.map((summary) => (
                    <NavLink
                        key={`summary-${summary.id}`}
                        href={`/summary/${documentId}/${summary.id}`}
                        label={summary.title}
                        Icon={<BsJournalText />}
                        router={router}
                    />
                ))}
        </Nav>
    );
}
