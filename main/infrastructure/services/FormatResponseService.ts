export class FormatResponseService {
    static formatToJson(data: any): object {
        return JSON.parse(JSON.stringify(data));
    }
}
