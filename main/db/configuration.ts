import { IConfig } from "shared/types/configuration";
import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";

interface ConfigurationCreationAttributes extends Optional<IConfig, "key"> {}

interface ConfigurationInstance
    extends Model<ConfigurationCreationAttributes, IConfig> {
    key: string;
    value: string | number;
}

const Configuration = db.define<ConfigurationInstance>("Configuration", {
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
});

export default Configuration;
