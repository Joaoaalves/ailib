import { useQuery, useQueryClient, useMutation } from "react-query";
import { IConversation, IMessage } from "shared/types/conversation";

const getConversations = async () => {
    const conversations = await window.api.conversation.getAll();
    return conversations ?? [];
};

const deleteConversation = async (conversationId: number) => {
    window.api.conversation.delete(conversationId);
};

const addConversation = async (message: IMessage) => {
    return await window.api.conversation.create(message);
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
