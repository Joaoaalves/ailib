import { Sequelize } from "sequelize";
import path from "path";

const db = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "database.sqlite"),
    logging: false,
});

export default db;
