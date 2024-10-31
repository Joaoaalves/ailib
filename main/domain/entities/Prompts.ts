import IMessage  from "./Message";

export default interface IPrompts {
    defaultChatInstruction: IMessage;
    titleCreationInstruction: IMessage;
    queryCreationInstruction: IMessage;
    createHyDEInstruction: IMessage;
    summaryCreationInstruction: IMessage;
}