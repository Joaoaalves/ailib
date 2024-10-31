import { ISetting, ISettingRepository } from "@domain/entities/Setting";
import Setting from "@domain/models/Setting";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class SettingRepository implements ISettingRepository {
    async create(setting: Partial<ISetting>) {
        const stt = await Setting.create(setting);
        return mapToEntity<ISetting>(stt);
    }

    async findAll(): Promise<ISetting[]> {
        const settings = await Setting.findAll();
        return settings.map((stt) => mapToEntity<ISetting>(stt));
    }

    async findById(settingId: string) {
        const stt = await Setting.findByPk(settingId);
        return mapToEntity<ISetting>(stt);
    }

    async update(settingId: number, { value }: Partial<ISetting>) {
        const stt = await Setting.findByPk(settingId);
        if (stt) {
            stt.value = value;
            await stt.save();
        }
    }
}
