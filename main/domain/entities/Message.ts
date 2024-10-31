export default interface IMessage {
    id?: number;
    content: string;
    role: "user" | "assistant" | "system";
}