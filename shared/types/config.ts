export interface IConfig {
    key: string;
    description?: string;
    value: string;
    niceName?: string;
    type?: "text" | "number" | "boolean" | "select";
    allowedValues?: string[];
}
