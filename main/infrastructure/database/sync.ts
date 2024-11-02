import db from "./database";

export default async function syncDatabase() {
    try {
        await db.sync({ alter: false });
    } catch (error) {
        throw error;
    }
}
