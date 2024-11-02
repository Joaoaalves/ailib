import { ipcMain } from "electron";

import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { ConversationRepositorySequelize } from "@infra/database/adapters/ConversationRepository";

import { ChatService } from "@infra/services/ChatService";
import { OpenAIService } from "@infra/services/OpenAIService";
import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";

const settingRepository = new SettingRepositorySequelize();
const conversationRepository = new ConversationRepositorySequelize();

const openAIService = new OpenAIService(
    new OpenAIAdapter(settingRepository),
    settingRepository,
);

const chatService = new ChatService(openAIService);

// Create Conversation
ipcMain.handle("createConversation", async (event, message) => {
    const conversationModel =
        await settingRepository.findById("conversationModel");
    const title = await chatService.createChatTitle(
        message,
        conversationModel.value,
    );

    const conversation = conversationRepository.create({ title });

    return FormatResponseService.formatToJson(conversation);
});

// Get Conversation with Messages
ipcMain.handle("getConversationMessages", async (event, conversationId) => {
    const conversation =
        await conversationRepository.getMessages(conversationId);

    return FormatResponseService.formatToJson(conversation);
});

// Get All Conversations
ipcMain.handle("getConversations", async (event) => {
    const conversations = await conversationRepository.findAll();
    return FormatResponseService.formatToJson(conversations);
});

// Delete Conversation
ipcMain.handle("deleteConversation", async (event, conversationId) => {
    const conversationRepository = new ConversationRepositorySequelize();

    await conversationRepository.delete(conversationId);
});

// Save Message to Conversation
ipcMain.handle("saveMessage", async (event, conversationId, message) => {
    try {
        const conversation =
            await conversationRepository.findById(conversationId);

        if (conversation) {
            const createdMessage = await conversationRepository.create(message);

            await conversationRepository.addMessage(
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
