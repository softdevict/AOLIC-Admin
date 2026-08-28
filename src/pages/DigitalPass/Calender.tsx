import React, { useState, useEffect } from 'react';

interface UserBooking {
    responseId: string;
    count: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

interface CalendarProps {
    eventTimeSlots?: { start: string; end: string }[];
    capacity?: number;
    users?: UserBooking[];
}

const Calender: React.FC<CalendarProps> = ({
    eventTimeSlots = [],
    capacity = 0,
    users = []
}) => {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [days, setDays] = useState<number[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const safeDate = (year: number, month: number, day: number) => {
        return new Date(Date.UTC(year, month, day));
    };

    // Always initialize to current month (live month)
    useEffect(() => {
        const now = new Date();
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }, []);

    // GENERATE DAYS OF MONTH
    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const arr: number[] = [];
        for (let i = 0; i < firstDay; i++) arr.push(0);
        for (let d = 1; d <= totalDays; d++) arr.push(d);
        while (arr.length % 7 !== 0) arr.push(0);

        setDays(arr);
    }, [currentDate]);

    // CHECK IF TODAY
    const isToday = (day: number) => {
        const t = new Date();
        return (
            day === t.getDate() &&
            currentDate.getMonth() === t.getMonth() &&
            currentDate.getFullYear() === t.getFullYear()
        );
    };

    // Normalize date to YYYY-MM-DD string for comparison
    const normalizeDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // CHECK IF ANY BOOKING COVERS THIS DAY → GREEN COLOR
    const isUserBookedDay = (day: number) => {
        if (day === 0) return false;

        const d = safeDate(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayStr = normalizeDate(d);

        return users.some(u => {
            const s = new Date(u.startDate);
            const e = new Date(u.endDate);
            const startStr = normalizeDate(s);
            const endStr = normalizeDate(e);
            return dayStr >= startStr && dayStr <= endStr;
        });
    };

    // SUM COUNTS FOR SLOT
    const getSlotTotalCount = (day: number, slot: any) => {
        if (!day) return 0;

        const d = safeDate(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayStr = normalizeDate(d);

        return users
            .filter(u => {
                const s = new Date(u.startDate);
                const e = new Date(u.endDate);
                const startStr = normalizeDate(s);
                const endStr = normalizeDate(e);

                const isSameDay = dayStr >= startStr && dayStr <= endStr;

                // ⭐ If slot has NO time → return all users for that day
                if (slot.start === "" && slot.end === "") {
                    return isSameDay;
                }

                // ⭐ Otherwise check start/end time
                return (
                    isSameDay &&
                    u.startTime === slot.start &&
                    u.endTime === slot.end
                );
            })
            .reduce((sum, u) => sum + u.count, 0);
    };


    // 🔥 CHECK IF ANY SLOT IN THAT DAY EXCEEDS CAPACITY
    const isOverCapacityDay = (day: number) => {
        if (day === 0) return false;

        return eventTimeSlots.some(slot => {
            const total = getSlotTotalCount(day, slot);
            return total > capacity;
        });

    };

    // DAY COLORS
    const getDayColor = (day: number) => {
        if (day === 0) return "bg-gray-100 text-gray-300";

        // 🔥 FIRST PRIORITY → RED
        if (isOverCapacityDay(day)) return "bg-red-500 text-white font-bold";

        if (isToday(day)) return "bg-blue-500 text-white font-bold";
        if (isUserBookedDay(day)) return "bg-green-500 text-white";

        return "bg-white text-gray-900 border";
    };

    return (
        <div className="flex gap-5 max-h-[20rem] mt-4">

            {/* LEFT — CALENDAR */}
            <div className="white rounded-2xl shadow-lg p-5 w-[65%] border ">

                {/* HEADER */}
                <div className="flex justify-between mb-4 text-lg font-bold">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>←</button>
                    {currentDate.toLocaleString("default", { month: "long" })}{" "}
                    {currentDate.getFullYear()}
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>→</button>
                </div>

                {/* WEEK DAYS */}
                <div className="grid grid-cols-7 text-center text-gray-500 mb-2 font-medium">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                {/* CALENDAR DAYS */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => (
                        <div
                            key={idx}
                            onClick={() => day !== 0 && setSelectedDay(day)}
                            className={`rounded p-1  cursor-pointer ${getDayColor(day)}`}
                        >
                            <div className="font-bold">{day !== 0 ? day : ""}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT — SLOT SUMMARY */}
            <div className="w-[35%] bg-white shadow p-4 rounded-xl border h-full">

                {selectedDay ? (
                    <>
                        <h2 className="text-xl font-bold mb-3 text-indigo-700">
                            Slots for {selectedDay} {currentDate.toLocaleString("default", { month: "long" })}
                        </h2>

                        <div className="space-y-2">
                            {eventTimeSlots.map((slot, index) => {

                                const totalSlotCount = getSlotTotalCount(selectedDay!, slot);
                                const overLimit = totalSlotCount > capacity;

                                return (
                                    <div
                                        key={index}
                                        className={`p-2 border rounded shadow-sm
        ${overLimit ? "bg-red-200 border-red-500" : "bg-indigo-50"}
    `}
                                    >
                                        {/* ❌ Do NOT show time when start & end are empty */}
                                        {(slot.start !== "" || slot.end !== "") && (
                                            <p className="font-semibold text-indigo-900">
                                                {slot.start} - {slot.end}
                                            </p>
                                        )}

                                        {/* ✅ ALWAYS show count if > 0 */}
                                        {totalSlotCount > 0 && (
                                            <p
                                                className={`text-sm font-bold mt-1 
                ${overLimit ? "text-red-700" : "text-green-700"}
            `}
                                            >
                                                Count: {totalSlotCount}
                                            </p>
                                        )}
                                    </div>


                                );
                            })}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-400 text-center mt-10">Select a day</p>
                )}

            </div>

        </div>
    );
};

export default Calender;