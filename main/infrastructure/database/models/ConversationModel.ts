import IConversation from "@domain/entities/Conversation";
import { DataTypes, Model, Optional } from "sequelize";
import db from "@infra/database/database";
import MessageModel from "./MessageModel";

interface ConversationCreationAttributes
    extends Optional<IConversation, "id"> {}

interface ConversationInstance
    extends Model<IConversation, ConversationCreationAttributes> {
    id: number;
    title: string;
    addMessage: (message: Model) => Promise<void>;
}

const ConversationModel = db.define<ConversationInstance>(
    "Conversation",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    },
);

ConversationModel.hasMany(MessageModel);

export default ConversationModel;
