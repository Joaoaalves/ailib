import { useQuery, useQueryClient, useMutation } from "react-query";
import { IMessage } from "shared/types/conversation";

const getConversations = async () => {
    const conversations = await window.backend.getConversations();
    return conversations ?? [];
};

const deleteConversation = async (conversationId: number) => {
    window.openai.deleteConversation(conversationId);
};

const addConversation = async (message: IMessage) => {
    await window.backend.createConversation(message);
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
        onSuccess: () => {
            queryClient.invalidateQueries("conversations");
        },
    });

    return {
        conversations: query.data,
        deleteConversation: deleteMutation.mutate,
        addConversation: addMutation.mutate,
    };
}
