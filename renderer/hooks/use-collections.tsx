import { useQuery, useQueryClient, useMutation } from "react-query";
import { ICollection } from "shared/types/collection";

const getCollections = async () => {
    const collections = await window.api.collection.getAll();
    return collections;
};

const deleteCollection = async (collectionId: number) => {
    window.api.collection.delete(collectionId);
};

const addCollection = async (collectionName: string) => {
    return window.api.collection.create(collectionName);
};

const updateCollection = async (collection: ICollection) => {
    return window.api.collection.update(collection.id, collection);
};

export function useCollections() {
    const queryClient = useQueryClient();

    const query = useQuery("collections", getCollections);

    const deleteMutation = useMutation(deleteCollection, {
        onSuccess: () => {
            queryClient.invalidateQueries("collections");
        },
    });

    const addMutation = useMutation(addCollection, {
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

    const updateMutation = useMutation(updateCollection, {
        onSuccess: (updatedCollection) => {
            queryClient.setQueryData(
                "collections",
                (oldData: ICollection[] | undefined) => {
                    if (!oldData) return [];
                    return oldData.map((collection) =>
                        collection.id === updatedCollection.id
                            ? updatedCollection
                            : collection,
                    );
                },
            );
        },
    });

    return {
        collections: query.data,
        deleteCollection: deleteMutation.mutate,
        createCollection: addMutation.mutate,
        updateCollection: updateMutation.mutate,
    };
}
