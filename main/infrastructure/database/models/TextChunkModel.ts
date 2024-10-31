import ITextChunk from "@domain/entities/TextChunk";
import { DataTypes, Model, Optional } from "sequelize";
import db from "@infra/database";

interface TextChunkCreationAttributes extends Optional<ITextChunk, "id"> {}

interface TextChunkInstance
    extends Model<ITextChunk, TextChunkCreationAttributes> {
    id: number;
    text: string;
}

const TextChunkModel = db.define<TextChunkInstance>("TextChunk", {
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

export default TextChunkModel;
