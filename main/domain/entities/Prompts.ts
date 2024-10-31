import { IMessage } from "./Message";

export interface IPrompts {
    defaultChatInstruction: IMessage;
    titleCreationInstruction: IMessage;
    queryCreationInstruction: IMessage;
    createHyDEInstruction: IMessage;
    summaryCreationInstruction: IMessage;
}
