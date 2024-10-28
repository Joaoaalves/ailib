import { ISetting, ISettingRepository } from "@entities/Setting";

export class SettingService {
    constructor(private settingRepository: ISettingRepository) {}

    async create(setting: Partial<ISetting>): Promise<ISetting> {
        return this.settingRepository.create(setting);
    }

    async findAll(): Promise<ISetting[]> {
        return this.settingRepository.findAll();
    }

    async findById(settingId: number): Promise<ISetting> {
        return this.findById(settingId);
    }

    async update(settingId: number, value: string): Promise<ISetting> {
        return this.update(settingId, value);
    }
}
