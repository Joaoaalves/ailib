import { useState } from "react";
import { useConfigs } from "@/hooks/use-config";
import { Label } from "../ui/Label";
import Input from "../ui/Input";
import { Button } from "../ui/Button";

export default function SettingsForm({ setOpen }) {
    const { configs, updateConfig } = useConfigs();
    const [formValues, setFormValues] = useState<Object>({});

    const handleInputChange = (key: string, value: string) => {
        setFormValues({
            ...formValues,
            [key]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await Promise.all(
            configs.map(async (config) => {
                if (formValues[config.key] !== undefined) {
                    updateConfig({
                        key: config.key,
                        value: formValues[config.key],
                    });
                }
            }),
        );

        setOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {configs?.length &&
                configs.map((config) => (
                    <div key={config.key} className="space-y-1 mb-6">
                        <Label className="text-white">{config.niceName}</Label>
                        <Input
                            value={formValues[config.key] || config.value}
                            onChange={(e) =>
                                handleInputChange(config.key, e.target.value)
                            }
                            placeholder={config.niceName}
                        />
                    </div>
                ))}

            <Button type="submit" className="text-white w-full">
                Save Settings
            </Button>
        </form>
    );
}
