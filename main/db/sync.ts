import db from "./connection";

export default async function syncDatabase() {
    try {
        await db.sync({ alter: false });
    } catch (error) {
        throw error;
    }
}
