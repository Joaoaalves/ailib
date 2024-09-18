import { useQuery, useQueryClient, useMutation } from "react-query";
import { IConfig } from "shared/types/config";

const getConfigs = async () => {
    const configs = await window.backend.getConfigs();
    return configs;
};

const updateConfig = async ({ key, value }: IConfig) => {
    const config = await window.backend.updateConfig(key, value);
    return config;
};

export function useConfigs() {
    const queryClient = useQueryClient();

    const query = useQuery("configs", getConfigs);

    const updateMutation = useMutation(updateConfig, {
        onSuccess: (updatedConfig) => {
            queryClient.setQueryData("configs", (oldData: IConfig[]) =>
                oldData.map((config) =>
                    config.key == updatedConfig.key ? updatedConfig : config,
                ),
            );
        },
    });

    return {
        configs: query.data,
        updateConfig: updateMutation.mutate,
    };
}
