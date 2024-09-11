import CreateCollection from "@/components/Collection/CreateCollection";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { ICollection } from "shared/types/collection";

const getCollections = async () => {
    const collections = await window.backend.getCollections();
    return collections;
};

const deleteCollection = async (collectionId: number) => {
    window.backend.deleteCollection(collectionId);
};

const addColection = async (collectionName: string) => {
    return window.backend.createCollection(collectionName);
};

export function useCollections() {
    const queryClient = useQueryClient();

    const query = useQuery("collections", getCollections);

    const deleteMutation = useMutation(deleteCollection, {
        onSuccess: () => {
            queryClient.invalidateQueries("collections");
        },
    });

    const addMutation = useMutation(addColection, {
        onSuccess: (newCollection) => {
            queryClient.setQueryData(
                "collections",
                (oldData: ICollection[] | undefined) => {
                    return oldData
                        ? [...oldData, newCollection]
                        : [newCollection];
                },
            );
        },
    });

    return {
        collections: query.data,
        deleteCollection: deleteMutation.mutate,
        createCollection: addMutation.mutate,
    };
}
