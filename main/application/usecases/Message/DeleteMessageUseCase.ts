import IMessage from "@domain/entities/Message";
import BaseDeleteUseCase from "../../interfaces/BaseDeleteUseCase";

export default class DeleteMessageUseCase extends BaseDeleteUseCase<IMessage> {}
