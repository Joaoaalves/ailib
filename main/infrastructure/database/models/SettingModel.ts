import ISetting from "@domain/entities/Setting";
import { DataTypes, Model, Optional } from "sequelize";
import db from "@infra/database";

interface SettingCreationAttributes extends Optional<ISetting, "key"> {}

interface SettingInstance extends Model<SettingCreationAttributes, ISetting> {
    key: string;
    value: string;
    description: string;
    niceName: string;
    type: string;
    allowedValues?: string[];
}

const SettingModel = db.define<SettingInstance>("Setting", {
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

export default SettingModel;