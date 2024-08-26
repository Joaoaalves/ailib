import { useEffect, useState } from "react";

export default function Welcome() {
    const [now, setNow] = useState<Date>(new Date());

    const getFormatedDate = () => {
        return `${now.getHours()}:${now.getMinutes()}, ${now.getDate()}/${now.getMonth()}, ${getWeekDayString(now.getDay())}`;
    };

    const getWeekDayString = (weekDay: number) => {
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return weekDays[weekDay];
    };

    useEffect(() => {
        var timer = setInterval(() => setNow(new Date()), 1000);

        return function cleanup() {
            clearInterval(timer);
        };
    });

    return (
        <div className="flex flex-col items-start justify-start p-4">
            <span className="font-bold text-neutral-300">Welcome!</span>
            <p className="text-neutral-300">
                It's{" "}
                <b className="font-bold underline text-white">
                    {getFormatedDate()}
                </b>
            </p>
        </div>
    );
}
