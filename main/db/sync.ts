import db from "./connection";
import Document from "./document";
import Collection from "./collection";
import Summary from "./summary";
import Conversation from "./conversation";
import Message from "./message";

export default async function syncDatabase() {
    await db.sync({ alter: false });
}
