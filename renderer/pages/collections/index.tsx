import CollectionCard from "@/components/Collection/CollectionCard";
import CreateCollection from "@/components/Collection/CreateCollection";
import Layout from "@/components/Layout";
import { useCollections } from "@/hooks/use-collections";

export default function Page() {
    const { collections } = useCollections();

    return (
        <Layout>
            <div className="grid grid-cols-3 gap-8 px-2 pt-4 items-center">
                <h1 className="text-white text-2xl font-bold col-start-2 text-center">
                    Collections
                </h1>
                <div className="col-start-3 flex justify-end">
                    <CreateCollection />
                </div>
                {collections?.length &&
                    collections.map((collection) => (
                        <CollectionCard collection={collection} />
                    ))}
            </div>
        </Layout>
    );
}
