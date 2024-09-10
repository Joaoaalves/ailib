import { useQuery, useQueryClient, useMutation } from "react-query";
import { IConversation, IMessage } from "shared/types/conversation";

const getConversations = async () => {
    const conversations = await window.backend.getConversations();
    return conversations ?? [];
};

const deleteConversation = async (conversationId: number) => {
    window.openai.deleteConversation(conversationId);
};

const addConversation = async (message: IMessage) => {
    return await window.backend.createConversation(message);
};

export function useConversations() {
    const queryClient = useQueryClient();

    const query = useQuery("conversations", getConversations);

    const deleteMutation = useMutation(deleteConversation, {
        onSuccess: () => {
            queryClient.invalidateQueries("conversations");
        },
    });

    const addMutation = useMutation(addConversation, {
        onSuccess: (newConversation) => {
            queryClient.setQueryData(
                "conversations",
                (oldData: IMessage[] | undefined) => {
                    return oldData
                        ? [...oldData, newConversation]
                        : [newConversation];
                },
            );
        },
    });

    return {
        conversations: query.data,
        deleteConversation: deleteMutation.mutate,
        createConversation: addMutation.mutate,
    };
}
