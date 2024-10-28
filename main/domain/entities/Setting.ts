export interface ISetting {
    key: string;
    value: string;
    description: string;
    niceName: string;
    type: string;
    allowedValues?: string[];
}

export interface ISettingRepository {
    create(setting: Partial<ISetting>): Promise<ISetting>;
    findById(settingId: number): Promise<ISetting>;
    findAll(): Promise<ISetting[]>;
    update(settingId: number, value: string): Promise<ISetting>;
}
