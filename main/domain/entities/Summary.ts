interface ISummary {
    id?: number;
    title: string;
    text?: string;
    path: string;
    page?: number;
}

export default class Summary {
    id?: number;
    title: string;
    text?: string;
    path: string;
    page?: number;

    constructor(data: ISummary) {
        Object.assign(this, data);
    }
}
