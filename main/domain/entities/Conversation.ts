import IMessage from "./Message";

export default interface IConversation {
    id: number;
    title: string;
    messages: IMessage[];
}
