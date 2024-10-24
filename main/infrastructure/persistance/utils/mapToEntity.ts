import { Model } from "sequelize";

export function mapToEntity<T>(model: Model): T {
    return model.get({ plain: true }) as T;
}
