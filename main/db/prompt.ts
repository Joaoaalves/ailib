import { DataTypes } from "sequelize";
import db from "./connection";

const Prompt = db.define(
    "Prompt",
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        role: {
            type: DataTypes.ENUM,
            values: ["system", "user"],
            allowNull: true,
            defaultValue: "system",
            
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        timestamps: true,
    },
)