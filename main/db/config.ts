import { IConfig } from "shared/types/config";
import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";

interface ConfigCreationAttributes extends Optional<IConfig, "key"> {}

interface ConfigInstance extends Model<ConfigCreationAttributes, IConfig> {
    key: string;
    value: string;
    niceName: string;
    allowedValues?: string[];
}

const Config = db.define<ConfigInstance>("Config", {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
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
});

export default Config;
