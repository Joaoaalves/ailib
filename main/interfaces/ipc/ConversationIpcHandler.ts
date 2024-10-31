import { ipcMain } from "electron";

import { SettingRepository } from "@application/repositories/Setting";
import { ConversationRepository } from "@application/repositories/Conversation";

import { ChatService } from "@application/services/Chat";
import { OpenAIService } from "@infra/services/OpenAI";
import { FormatResponseService } from "@application/services/FormatResponse";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";

const settingRepository = new SettingRepository();
const conversationRepository = new ConversationRepository();

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
    const conversationRepository = new ConversationRepository();

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
