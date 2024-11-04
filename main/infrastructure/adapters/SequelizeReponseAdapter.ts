import { Model } from "sequelize";

export class EntityMapper{
    static mapToEntity<T>(model: Model): T {
        return model.get({ plain: true }) as T;
    }
}