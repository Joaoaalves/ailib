import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";
import Message from "./message";

interface ConversationAttributes {
    id: number;
    title: string;
}

interface ConversationCreationAttributes
    extends Optional<ConversationAttributes, "id"> {}

interface ConversationInstance
    extends Model<ConversationAttributes, ConversationCreationAttributes> {
    id: number;
    title: string;
    addMessage: (message: typeof Message) => Promise<void>;
}

const Conversation = db.define<ConversationInstance>(
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

Conversation.hasMany(Message);

export default Conversation;
