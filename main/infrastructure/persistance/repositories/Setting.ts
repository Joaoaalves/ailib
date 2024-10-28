import { ISetting, ISettingRepository } from "@entities/Setting";
import Setting from "@models/Setting";
import { mapToEntity } from "../utils/mapToEntity";

export class SettingRepository implements ISettingRepository {
    async create(setting: Partial<ISetting>): Promise<ISetting> {
        const stt = await Setting.create(setting);
        return mapToEntity<ISetting>(stt);
    }

    async findAll(): Promise<ISetting[]> {
        const settings = await Setting.findAll();
        return settings.map((stt) => mapToEntity<ISetting>(stt));
    }

    async findById(settingId: number): Promise<ISetting> {
        const stt = await Setting.findByPk(settingId);
        return mapToEntity<ISetting>(stt);
    }

    async update(settingId: number, value: string): Promise<ISetting> {
        const stt = await Setting.findByPk(settingId);
        if (stt) {
            stt.value = value;
            await stt.save();
            return stt;
        }
    }
}
