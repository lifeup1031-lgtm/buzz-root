"use client";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

type StatsData = {
    platform: string;
    views: number;
    likes: number;
    saves: number;
    views_1h: number;
    drop_off_rate: number;
};

const PLATFORM_LABELS: Record<string, string> = {
    youtube: "YouTube",
    tiktok: "TikTok",
    instagram: "Instagram",
};

const PLATFORM_COLORS: Record<string, string> = {
    youtube: "#ff0033",
    tiktok: "#00f2ea",
    instagram: "#c13584",
};

export default function ComparisonChart({ stats }: { stats: StatsData[] }) {
    if (!stats || stats.length === 0) {
        return (
            <div className="section-card" style={{ textAlign: "center", padding: 40 }}>
                <p style={{ color: "var(--color-text-muted)" }}>
                    投稿を選択すると比較チャートが表示されます
                </p>
            </div>
        );
    }

    const barData = [
        {
            name: "再生数",
            ...Object.fromEntries(stats.map((s) => [PLATFORM_LABELS[s.platform], s.views])),
        },
        {
            name: "いいね",
            ...Object.fromEntries(stats.map((s) => [PLATFORM_LABELS[s.platform], s.likes])),
        },
        {
            name: "保存数",
            ...Object.fromEntries(stats.map((s) => [PLATFORM_LABELS[s.platform], s.saves])),
        },
    ];

    return (
        <div className="section-card">
            <h3>📊 メトリクス比較</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                background: "#1a1a2e",
                                border: "1px solid #2a2a40",
                                borderRadius: 8,
                                fontSize: 13,
                            }}
                        />
                        <Legend />
                        {stats.map((s) => (
                            <Bar
                                key={s.platform}
                                dataKey={PLATFORM_LABELS[s.platform]}
                                fill={PLATFORM_COLORS[s.platform]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
