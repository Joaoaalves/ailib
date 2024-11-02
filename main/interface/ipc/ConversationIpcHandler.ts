import { ipcMain } from "electron";

import CreateConversationUseCase from "@application/usecases/Conversation/CreateConversationUseCase";

import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { ConversationRepositorySequelize } from "@infra/database/adapters/ConversationRepository";

import { ChatService } from "@infra/services/ChatService";
import { OpenAIService } from "@infra/services/OpenAIService";
import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import GetConversationMessagesUseCase from "@application/usecases/Conversation/GetConversationMessagesUseCase";
import DeleteConversationUseCase from "@application/usecases/Conversation/DeleteConversationUseCase";
import ListConversationsUseCase from "@application/usecases/Message/ListConversationsUseCase";
import GetConversationUseCase from "@application/usecases/Conversation/GetConversationUseCase";
import AddMessageToConversationUseCase from "@application/usecases/Message/AddMessageToConversationUseCase";

const settingRepository = new SettingRepositorySequelize();
const conversationRepository = new ConversationRepositorySequelize();

const openAIService = new OpenAIService(
    new OpenAIAdapter(settingRepository),
    settingRepository,
);

const chatService = new ChatService(openAIService);
const createConversationUseCase = new CreateConversationUseCase(
    conversationRepository,
);
const getConversationMessagesUseCase = new GetConversationMessagesUseCase(
    conversationRepository,
);
const deleteConversationUseCase = new DeleteConversationUseCase(
    conversationRepository,
);
const listConversationsUseCase = new ListConversationsUseCase(
    conversationRepository,
);
const getConversationUseCase = new GetConversationUseCase(
    conversationRepository,
);
const addMessageToConversationUseCase = new AddMessageToConversationUseCase(
    conversationRepository,
);

// Create Conversation
ipcMain.handle("createConversation", async (event, message) => {
    const conversationModel =
        await settingRepository.findById("conversationModel");
    const title = await chatService.createChatTitle(
        message,
        conversationModel.value,
    );

    const conversation = createConversationUseCase.execute({ title });

    return FormatResponseService.formatToJson(conversation);
});

// Get Conversation with Messages
ipcMain.handle("getConversationMessages", async (event, conversationId) => {
    const conversation =
        await getConversationMessagesUseCase.execute(conversationId);

    return FormatResponseService.formatToJson(conversation);
});

// Get All Conversations
ipcMain.handle("getConversations", async (event) => {
    const conversations = await listConversationsUseCase.execute();
    return FormatResponseService.formatToJson(conversations);
});

// Delete Conversation
ipcMain.handle("deleteConversation", async (event, conversationId) => {
    await deleteConversationUseCase.execute(conversationId);
});

// Save Message to Conversation
ipcMain.handle("saveMessage", async (event, conversationId, message) => {
    try {
        const conversation =
            await getConversationUseCase.execute(conversationId);

        if (conversation) {
            const createdMessage =
                await createConversationUseCase.execute(message);

            await addMessageToConversationUseCase.execute(
                conversationId,
                createdMessage.id,
            );

            return FormatResponseService.formatToJson(createdMessage);
        } else {
            throw new Error("Conversation not found");
        }
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
});
