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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";

type StatsData = {
    platform: string;
    views: number;
    likes: number;
    saves: number;
    views_1h: number;
};

const PLATFORM_COLORS: Record<string, string> = {
    youtube: "#ff0033",
    tiktok: "#00f2ea",
    instagram: "#c13584",
};

const PLATFORM_LABELS: Record<string, string> = {
    youtube: "YouTube",
    tiktok: "TikTok",
    instagram: "Instagram",
};

export default function ComparisonChart({ stats }: { stats: StatsData[] }) {
    if (!stats || stats.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>
                動画を選択してグラフを表示
            </div>
        );
    }

    // Bar chart data
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

    // Radar chart data (normalized 0-100)
    const maxViews = Math.max(...stats.map((s) => s.views), 1);
    const maxLikes = Math.max(...stats.map((s) => s.likes), 1);
    const maxSaves = Math.max(...stats.map((s) => s.saves), 1);
    const maxVelocity = Math.max(...stats.map((s) => s.views_1h), 1);

    const radarData = stats.map((s) => ({
        platform: PLATFORM_LABELS[s.platform],
        再生数: Math.round((s.views / maxViews) * 100),
        いいね: Math.round((s.likes / maxLikes) * 100),
        保存数: Math.round((s.saves / maxSaves) * 100),
        初速: Math.round((s.views_1h / maxVelocity) * 100),
    }));

    return (
        <div className="chart-grid">
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

            <div className="section-card">
                <h3>🎯 パフォーマンスレーダー</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="platform" stroke="#888" fontSize={12} />
                            <PolarRadiusAxis stroke="#555" fontSize={10} />
                            {["再生数", "いいね", "保存数", "初速"].map((key, i) => (
                                <Radar
                                    key={key}
                                    name={key}
                                    dataKey={key}
                                    stroke={["#6366f1", "#22c55e", "#f59e0b", "#ef4444"][i]}
                                    fill={["#6366f1", "#22c55e", "#f59e0b", "#ef4444"][i]}
                                    fillOpacity={0.15}
                                />
                            ))}
                            <Legend />
                            <Tooltip
                                contentStyle={{
                                    background: "#1a1a2e",
                                    border: "1px solid #2a2a40",
                                    borderRadius: 8,
                                    fontSize: 13,
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
