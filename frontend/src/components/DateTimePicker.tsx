"use client";
import { useState, useEffect, useRef } from "react";

interface DateTimePickerProps {
    date: string;
    time: string;
    onDateChange: (d: string) => void;
    onTimeChange: (t: string) => void;
}

export default function DateTimePicker({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Generate calendar days
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleDateClick = (d: number | null) => {
        if (!d) return;
        const selectedDate = new Date(year, month, d);
        if (selectedDate < today) return; // Prevent past dates

        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        onDateChange(`${y}-${m}-${day}`);
    };

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
    const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

    const currentHour = time.split(":")[0] || "12";
    const currentMinute = time.split(":")[1] || "00";

    const hourRef = useRef<HTMLDivElement>(null);
    const minRef = useRef<HTMLDivElement>(null);

    // Auto scroll to current time on mount (simplified)
    useEffect(() => {
        if (hourRef.current && minRef.current) {
            const hIdx = hours.indexOf(currentHour);
            const mIdx = minutes.indexOf(currentMinute);
            hourRef.current.scrollTop = Math.max(0, hIdx * 36 - 36);
            minRef.current.scrollTop = Math.max(0, mIdx * 36 - 36);
        }
    }, [currentHour, currentMinute, hours, minutes]);

    return (
        <div className="datetime-custom-picker">
            <div className="picker-calendar">
                <div className="calendar-header">
                    <button type="button" onClick={prevMonth}>&lt;</button>
                    <span>{year}年 {month + 1}月</span>
                    <button type="button" onClick={nextMonth}>&gt;</button>
                </div>
                <div className="calendar-weekdays">
                    {["日", "月", "火", "水", "木", "金", "土"].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="calendar-grid">
                    {days.map((d, i) => {
                        if (!d) return <div key={`empty-${i}`} className="calendar-day empty" />;
                        const cellDate = new Date(year, month, d);
                        const isPast = cellDate < today;
                        const cellDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                        const isSelected = cellDateStr === date;

                        return (
                            <div
                                key={i}
                                className={`calendar-day ${isPast ? "past" : ""} ${isSelected ? "selected" : ""}`}
                                onClick={() => handleDateClick(d)}
                            >
                                {d}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="picker-time">
                <div className="time-col" ref={hourRef}>
                    {hours.map(h => (
                        <div
                            key={h}
                            className={`time-cell ${h === currentHour ? "selected" : ""}`}
                            onClick={() => onTimeChange(`${h}:${currentMinute}`)}
                        >
                            {h}
                        </div>
                    ))}
                </div>
                <div className="time-col-sep">:</div>
                <div className="time-col" ref={minRef}>
                    {minutes.map(m => (
                        <div
                            key={m}
                            className={`time-cell ${m === currentMinute ? "selected" : ""}`}
                            onClick={() => onTimeChange(`${currentHour}:${m}`)}
                        >
                            {m}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
