import { useState } from "react";

export function SetApiKey() {
    const [apiKey, SetApiKey] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        window.openai.setApiKey(apiKey);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                className="w-full bg-transparent border border-white rounded p-2 text-white"
                value={apiKey}
                onChange={(e) => SetApiKey(e.target.value)}
            />
            <input
                type="submit"
                value="Submit"
                className="w-full bg-transparent border border-white text-white p-4 cursor-pointer hover:bg-white hover:text-black"
            />
        </form>
    );
}
