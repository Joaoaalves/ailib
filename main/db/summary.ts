import { ISummary } from "shared/types/summary";
import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";

interface SummaryCreationAttributes extends Optional<ISummary, "id"> {}

interface SummaryInstance extends Model<ISummary, SummaryCreationAttributes> {
    id?: number;
    title: string;
    path: string;
    summaryType: "page" | "chapter" | "file";
    page?: number;
    chapter?: number;
    createAt: Date;
}

const Summary = db.define<SummaryInstance>(
    "Summary",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        summaryType: {
            type: DataTypes.ENUM("page", "chapter", "file", "interval"),
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

export default Summary;
