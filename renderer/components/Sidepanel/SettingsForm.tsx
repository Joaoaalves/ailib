import { useState } from "react";
import { useConfigs } from "@/hooks/use-config";
import { Label } from "../ui/Label";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";

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
                    <div
                        key={config.key}
                        className="flex flex-col gap-y-2 mb-6"
                    >
                        <Label className="text-white">{config.niceName}</Label>
                        {config.type == "select" && (
                            <Select
                                defaultValue={config.value}
                                onValueChange={(e) =>
                                    handleInputChange(config.key, e)
                                }
                                required
                            >
                                <SelectTrigger className="!text-neutral-400">
                                    <SelectValue
                                        placeholder={config.niceName}
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-black text-white">
                                    <SelectGroup>
                                        {config.allowedValues.map(
                                            (allowedValue) => (
                                                <SelectItem
                                                    value={allowedValue}
                                                    key={allowedValue}
                                                >
                                                    {allowedValue}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}

                        {config.type == "text" && (
                            <Input
                                value={formValues[config.key] || config.value}
                                onChange={(e) =>
                                    handleInputChange(
                                        config.key,
                                        e.target.value,
                                    )
                                }
                                placeholder={config.niceName}
                            />
                        )}

                        {config.type == "boolean" && (
                            <Switch
                                className="mt-2"
                                checked={
                                    formValues[config.key] == "true" ||
                                    config.value == "true"
                                }
                                onCheckedChange={(e) =>
                                    handleInputChange(config.key, String(e))
                                }
                            />
                        )}
                    </div>
                ))}

            <Button type="submit" className="text-white w-full">
                Save Settings
            </Button>
        </form>
    );
}
