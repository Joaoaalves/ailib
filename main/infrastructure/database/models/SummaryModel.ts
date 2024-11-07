import ISummary from "@domain/entities/Summary";
import { DataTypes, Model, Optional } from "sequelize";
import db from "@infra/database/database";

interface SummaryCreationAttributes extends Optional<ISummary, "id"> {}

interface SummaryInstance extends Model<ISummary, SummaryCreationAttributes> {
    id?: number;
    title: string;
    path: string;
    page?: number;
}

const SummaryModel = db.define<SummaryInstance>(
    "Summary",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        page: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        timestamps: false,
    },
);

export default SummaryModel;
