import { IConfig } from "shared/types/configuration";
import { DataTypes, Model, Optional } from "sequelize";
import db from "./connection";

interface ConfigurationCreationAttributes extends Optional<IConfig, "id"> {}

interface ConfigurationInstance
    extends Model<ConfigurationCreationAttributes, IConfig> {
    id: number;
    key: string;
    value: string | number;
}

const Configuration = db.define<ConfigurationInstance>("Configuration", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Configuration;
