import { ITextChunk } from "shared/types/document";
import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";

interface TextChunkCreationAttributes extends Optional<ITextChunk, "id"> {}

interface TextChunkInstance
    extends Model<ITextChunk, TextChunkCreationAttributes> {
    id: number;
    text: string;
}

const TextChunk = db.define<TextChunkInstance>("TextChunk", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default TextChunk;
