"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { ICollection } from "shared/types/collection";
import Collection from "@/components/Collection/Collection";
import { useCollections } from "@/hooks/use-collections";

export default function HomePage() {
    const { collections } = useCollections();

    return (
        <React.Fragment>
            <Head>
                <title>AILib</title>
            </Head>
            <Layout>
                {collections?.length > 0 &&
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
