import CreateCollection from "@/components/Collection/CreateCollection";
import Layout from "@/components/Layout";

export default function Page() {
    return (
        <Layout>
            <h1 className="text-2xl text-white">Collections</h1>
            <CreateCollection />
        </Layout>
    );
}
