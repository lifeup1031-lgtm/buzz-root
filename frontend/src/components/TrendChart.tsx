"use client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";

type TrendData = Record<string, unknown>;

const PLATFORM_COLORS: Record<string, string> = {
    youtube: "#ff0033",
    tiktok: "#00f2ea",
    instagram: "#c13584",
};

const METRICS = [
    { key: "views", label: "再生数" },
    { key: "likes", label: "いいね" },
    { key: "saves", label: "保存数" },
];

const PERIODS = [
    { key: "7", label: "1週間" },
    { key: "30", label: "1ヶ月" },
    { key: "180", label: "半年" },
    { key: "365", label: "1年" },
    { key: "all", label: "すべて" },
];

function formatNumber(num: number): string {
    if (num >= 100_000_000) return (num / 100_000_000).toFixed(1) + "億";
    if (num >= 10_000) return (num / 10_000).toFixed(1) + "万";
    return num.toString();
}

export default function TrendChart({ data }: { data: TrendData[] }) {
    const [metric, setMetric] = useState("views");
    const [period, setPeriod] = useState("30");

    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (period === "all") return data;
        const days = parseInt(period);
        return data.slice(-days);
    }, [data, period]);

    if (!data || data.length === 0) {
        return (
            <div className="section-card" style={{ textAlign: "center", padding: 40 }}>
                <p style={{ color: "var(--color-text-muted)" }}>トレンドデータがありません</p>
            </div>
        );
    }

    return (
        <div className="section-card">
            <div className="trend-header">
                <h3 style={{ margin: 0 }}>📈 パフォーマンス推移</h3>
                <div className="trend-controls">
                    <div className="trend-btn-group">
                        {METRICS.map((m) => (
                            <button
                                key={m.key}
                                onClick={() => setMetric(m.key)}
                                className={`trend-btn ${metric === m.key ? "active" : ""}`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                    <div className="trend-btn-group">
                        {PERIODS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => setPeriod(p.key)}
                                className={`trend-btn period ${period === p.key ? "active" : ""}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#888" fontSize={11} />
                        <YAxis stroke="#888" fontSize={11} tickFormatter={formatNumber} />
                        <Tooltip
                            contentStyle={{
                                background: "#1a1a2e",
                                border: "1px solid #2a2a40",
                                borderRadius: 8,
                                fontSize: 13,
                            }}
                            formatter={(value: number | undefined) => [formatNumber(value ?? 0), ""]}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey={`youtube_${metric}`}
                            name="YouTube"
                            stroke={PLATFORM_COLORS.youtube}
                            strokeWidth={2.5}
                            dot={filteredData.length <= 60 ? { r: 2 } : false}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey={`tiktok_${metric}`}
                            name="TikTok"
                            stroke={PLATFORM_COLORS.tiktok}
                            strokeWidth={2.5}
                            dot={filteredData.length <= 60 ? { r: 2 } : false}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey={`instagram_${metric}`}
                            name="Instagram"
                            stroke={PLATFORM_COLORS.instagram}
                            strokeWidth={2.5}
                            dot={filteredData.length <= 60 ? { r: 2 } : false}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
