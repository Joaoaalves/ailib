import { ICollection } from "./../../shared/types/collection";
import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";
import Document from "./document";

interface CollectionAttributes {
    id: number;
    name: string;
}

interface CollectionCreationAttributes extends Optional<ICollection, "id"> {}

interface CollectionInstance
    extends Model<CollectionAttributes, CollectionCreationAttributes> {
    id: number;
    name: string;
    addDocument: (document: typeof Document) => Promise<void>;
}

const Collection = db.define<CollectionInstance>(
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

Collection.hasMany(Document);

export default Collection;
