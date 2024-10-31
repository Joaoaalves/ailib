import { IRepository } from "./Repository";

export interface ISetting {
    key: string;
    value: string;
    description: string;
    niceName: string;
    type: string;
    allowedValues?: string[];
}

export interface ISettingRepository extends IRepository<ISetting> {}
