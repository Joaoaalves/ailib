export interface IConfig {
    key: string;
    value: string;
    niceName?: string;
    type?: "text" | "number" | "boolean" | "select";
    allowedValues?: string[];
}
