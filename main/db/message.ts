import { DataTypes } from "sequelize";
import db from "./connection";

const Message = db.define("Message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("user", "assistant", "system"),
        allowNull: false,
    },
});

export default Message;
