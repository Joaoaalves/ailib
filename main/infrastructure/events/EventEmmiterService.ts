import { IpcMainEvent } from "electron";
import { EventsChannel } from "./EventsChannel";

export interface IEventEmitterService {
    getInstance(): IEventEmitterService;
    setSender(sender: IpcMainEvent): void;
    emitProgress(eventName: string, progress: number, details?: any): void;
    emit(eventName: string, data: any): void;
}

export class EventEmitterService {
    private static instance: EventEmitterService;
    private sender: IpcMainEvent["sender"] | null = null;

    private constructor() {}

    public static getInstance(): EventEmitterService {
        if (!EventEmitterService.instance) {
            EventEmitterService.instance = new EventEmitterService();
        }
        return EventEmitterService.instance;
    }

    public setSender(sender: IpcMainEvent["sender"]): void {
        this.sender = sender;
    }

    public emitProgress(eventName: EventsChannel, progress: number): void {
        if (this.sender) {
            this.sender.send(eventName, progress);
        }
    }

    public emit(eventName: EventsChannel, data?: any): void {
        if (this.sender) {
            this.sender.send(eventName, data);
        }
    }
}
