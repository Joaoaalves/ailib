export default interface ISetting {
    key: string;
    value: string;
    description: string;
    niceName: string;
    type: string;
    allowedValues?: string[];
}
