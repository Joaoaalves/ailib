import ISetting from "@domain/entities/Setting";
import ISettingRepository from "@domain/repositories/SettingRepository";
import SettingModel from "@infra/database/models/SettingModel";
import { mapToEntity } from "@infra/adapters/SequelizeReponseAdapter";

export class SettingRepositorySequelize implements ISettingRepository {
    async create(setting: Partial<ISetting>) {
        const stt = await SettingModel.create(setting);
        return mapToEntity<ISetting>(stt);
    }

    async findAll(): Promise<ISetting[]> {
        const settings = await SettingModel.findAll();
        return settings.map((stt) => mapToEntity<ISetting>(stt));
    }

    async findById(settingId: string) {
        const stt = await SettingModel.findByPk(settingId);
        return mapToEntity<ISetting>(stt);
    }

    async update(settingId: number, { value }: Partial<ISetting>) {
        const stt = await SettingModel.findByPk(settingId);
        if (stt) {
            stt.value = value;
            await stt.save();
        }
    }
}
