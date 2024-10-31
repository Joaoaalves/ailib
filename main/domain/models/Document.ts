import { IDocument } from "@domain/entities/Document";
import { DataTypes, Model, Optional } from "sequelize";
import db from "@infra/database";
import Summary from "./Summary";

interface DocumentCreationAttributes extends Optional<IDocument, "id"> {}

interface DocumentInstance
    extends Model<IDocument, DocumentCreationAttributes> {
    id: number;
    name: string;
    path: string;
    cover?: string;
    totalPages?: number;
    lastPageRead?: number;
}

const Document = db.define<DocumentInstance>(
    "Document",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cover: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        totalPages: {
            type: DataTypes.NUMBER,
            allowNull: true,
        },
        lastPageRead: {
            type: DataTypes.NUMBER,
            allowNull: false,
            defaultValue: 1,
        },
    },
    {
        timestamps: false,
    },
);

Document.hasMany(Summary, { as: "summaries", foreignKey: "documentId" });

export default Document;
