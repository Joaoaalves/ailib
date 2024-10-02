import { IConfig } from "shared/types/config";
import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";

interface ConfigCreationAttributes extends Optional<IConfig, "key"> {}

interface ConfigInstance extends Model<ConfigCreationAttributes, IConfig> {
    key: string;
    value: string;
    description: string;
    niceName: string;
    type: string;
    allowedValues?: string[];
}

const Config = db.define<ConfigInstance>("Config", {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    niceName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    allowedValues: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM("text", "boolean", "select", "number"),
        allowNull: false,
    },
});

export default Config;
