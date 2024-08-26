import { DataTypes } from "sequelize";
import db from "./connection";
import Document from "./document";

const Summary = db.define(
    "Summary",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        summary_type: {
            type: DataTypes.ENUM("page", "chapter", "file"),
            allowNull: false,
        },
        page: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        chapter: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
    },
);

Summary.hasOne(Document);

export default Summary;
