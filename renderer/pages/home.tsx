"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { ICollection } from "shared/types/collection";
import Collection from "@/components/Collection/Collection";

export default function HomePage() {
    const [collections, setCollections] = useState<ICollection[] | []>([]);

    const getCollections = async () => {
        const colls = await window.backend.getCollections();
        setCollections(colls);
    };
    useEffect(() => {
        getCollections();
    }, []);

    return (
        <React.Fragment>
            <Head>
                <title>AILib</title>
            </Head>
            <Layout>
                {collections.length > 0 &&
                    collections.map((collection: ICollection) => (
                        <Collection
                            collection={collection}
                            key={collection.id}
                        />
                    ))}
            </Layout>
        </React.Fragment>
    );
}
