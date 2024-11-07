import ICollection from "@domain/entities/Collection";
import { DataTypes, Model, Optional } from "sequelize";
import db from "@infra/database/database";
import DocumentModel from "./DocumentModel";

interface CollectionAttributes {
    id: number;
    name: string;
}

interface CollectionCreationAttributes extends Optional<ICollection, "id"> {}

interface CollectionInstance
    extends Model<CollectionAttributes, CollectionCreationAttributes> {
    id: number;
    name: string;
    addDocument: (document: Model) => Promise<void>;
}

const CollectionModel = db.define<CollectionInstance>(
    "Collection",
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
    },
    {
        timestamps: false,
    },
);

CollectionModel.hasMany(DocumentModel);

export default CollectionModel;
