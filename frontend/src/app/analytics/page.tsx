"use client";
import { useEffect, useState } from "react";
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

const API_BASE = "http://localhost:8000";

type PostData = {
    id: number;
    title: string;
    stats: {
        platform: string;
        views: number;
        likes: number;
        saves: number;
        views_1h: number;
    }[];
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

function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toLocaleString();
}

function calculateSaveRate(saves: number, views: number): string {
    if (views === 0) return "0.00";
    return ((saves / views) * 100).toFixed(2);
}

function calculateVelocity(views1h: number, views: number): string {
    if (views === 0) return "0.00";
    return ((views1h / views) * 100).toFixed(2);
}

export default function AnalyticsPage() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/posts`)
            .then((r) => r.json())
            .then((data) => {
                setPosts(data.posts || []);
                setLoading(false);
            })
            .catch(() => {
                // Mock data
                setPosts([
                    {
                        id: 1, title: "朝のルーティン⏰",
                        stats: [
                            { platform: "youtube", views: 12500, likes: 890, saves: 320, views_1h: 4200 },
                            { platform: "tiktok", views: 45200, likes: 3400, saves: 1200, views_1h: 18000 },
                            { platform: "instagram", views: 8900, likes: 1200, saves: 580, views_1h: 3100 },
                        ],
                    },
                    {
                        id: 2, title: "カフェ巡り☕ in 渋谷",
                        stats: [
                            { platform: "youtube", views: 28300, likes: 2100, saves: 780, views_1h: 8500 },
                            { platform: "tiktok", views: 56700, likes: 4200, saves: 1500, views_1h: 22000 },
                            { platform: "instagram", views: 19800, likes: 3100, saves: 1100, views_1h: 7200 },
                        ],
                    },
                    {
                        id: 3, title: "簡単レシピ🍳 5分パスタ",
                        stats: [
                            { platform: "youtube", views: 35100, likes: 2800, saves: 950, views_1h: 12000 },
                            { platform: "tiktok", views: 67800, likes: 5100, saves: 1800, views_1h: 28000 },
                            { platform: "instagram", views: 24500, likes: 3800, saves: 1400, views_1h: 8800 },
                        ],
                    },
                ]);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                <p style={{ color: "var(--color-text-muted)" }}>データを読み込み中...</p>
            </div>
        );
    }

    const selected = posts[selectedIdx];
    if (!selected) return null;

    const metrics = ["views", "likes", "saves", "views_1h"] as const;
    const metricLabels: Record<string, string> = {
        views: "再生数",
        likes: "いいね",
        saves: "保存数",
        views_1h: "初速（1h）",
    };

    // Find best platform for each metric
    const bestFor: Record<string, string> = {};
    metrics.forEach((m) => {
        const best = selected.stats.reduce((a, b) => (a[m] > b[m] ? a : b));
        bestFor[m] = best.platform;
    });

    // Chart data
    const chartData = metrics.map((m) => {
        const entry: Record<string, string | number> = { name: metricLabels[m] };
        selected.stats.forEach((s) => {
            entry[PLATFORM_LABELS[s.platform]] = s[m];
        });
        return entry;
    });

    // Save rate & velocity for each platform
    const analysisData = selected.stats.map((s) => ({
        ...s,
        saveRate: calculateSaveRate(s.saves, s.views),
        velocity: calculateVelocity(s.views_1h, s.views),
        engagementRate: s.views > 0 ? (((s.likes + s.saves) / s.views) * 100).toFixed(2) : "0.00",
    }));

    const bestEngagement = analysisData.reduce((a, b) =>
        parseFloat(a.engagementRate) > parseFloat(b.engagementRate) ? a : b
    );

    return (
        <>
            <div className="page-header">
                <h2>分析</h2>
                <p>プラットフォーム間のパフォーマンスを詳細比較</p>
            </div>

            {/* Post Selector */}
            <div className="section-card" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {posts.map((post, idx) => (
                        <button
                            key={post.id}
                            onClick={() => setSelectedIdx(idx)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                border: `1px solid ${idx === selectedIdx ? "var(--color-accent)" : "var(--color-border)"}`,
                                background: idx === selectedIdx ? "rgba(99,102,241,0.15)" : "transparent",
                                color: idx === selectedIdx ? "#818cf8" : "var(--color-text-muted)",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: idx === selectedIdx ? 600 : 400,
                                fontFamily: "inherit",
                            }}
                        >
                            {post.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Analysis Summary */}
            <div
                style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: "var(--color-gold-soft)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <span style={{ fontSize: 24 }}>🏆</span>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                        最高エンゲージメント: {PLATFORM_LABELS[bestEngagement.platform]}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                        エンゲージメント率 {bestEngagement.engagementRate}% · 保存率 {bestEngagement.saveRate}% · 初速 {bestEngagement.velocity}%
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Bar Chart */}
                <div className="section-card">
                    <h3>📊 メトリクス比較</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                {selected.stats.map((s) => (
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

                {/* Detailed Metrics Table */}
                <div className="section-card">
                    <h3>📋 詳細分析</h3>
                    <table className="video-table">
                        <thead>
                            <tr>
                                <th>指標</th>
                                {selected.stats.map((s) => (
                                    <th key={s.platform} style={{ color: PLATFORM_COLORS[s.platform] }}>
                                        {PLATFORM_LABELS[s.platform]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map((m) => (
                                <tr key={m}>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>{metricLabels[m]}</td>
                                    {selected.stats.map((s) => (
                                        <td
                                            key={s.platform}
                                            style={{
                                                fontVariantNumeric: "tabular-nums",
                                                fontWeight: bestFor[m] === s.platform ? 700 : 400,
                                                color: bestFor[m] === s.platform ? "var(--color-gold)" : undefined,
                                            }}
                                        >
                                            {formatNumber(s[m])}
                                            {bestFor[m] === s.platform && " 👑"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td style={{ fontWeight: 600, fontSize: 13 }}>保存率</td>
                                {analysisData.map((s) => {
                                    const best = analysisData.reduce((a, b) =>
                                        parseFloat(a.saveRate) > parseFloat(b.saveRate) ? a : b
                                    );
                                    return (
                                        <td
                                            key={s.platform}
                                            style={{
                                                fontVariantNumeric: "tabular-nums",
                                                fontWeight: s.platform === best.platform ? 700 : 400,
                                                color: s.platform === best.platform ? "var(--color-gold)" : undefined,
                                            }}
                                        >
                                            {s.saveRate}%
                                            {s.platform === best.platform && " 👑"}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600, fontSize: 13 }}>初速スコア</td>
                                {analysisData.map((s) => {
                                    const best = analysisData.reduce((a, b) =>
                                        parseFloat(a.velocity) > parseFloat(b.velocity) ? a : b
                                    );
                                    return (
                                        <td
                                            key={s.platform}
                                            style={{
                                                fontVariantNumeric: "tabular-nums",
                                                fontWeight: s.platform === best.platform ? 700 : 400,
                                                color: s.platform === best.platform ? "var(--color-gold)" : undefined,
                                            }}
                                        >
                                            {s.velocity}%
                                            {s.platform === best.platform && " 👑"}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600, fontSize: 13 }}>エンゲージメント率</td>
                                {analysisData.map((s) => (
                                    <td
                                        key={s.platform}
                                        style={{
                                            fontVariantNumeric: "tabular-nums",
                                            fontWeight: s.platform === bestEngagement.platform ? 700 : 400,
                                            color: s.platform === bestEngagement.platform ? "var(--color-gold)" : undefined,
                                        }}
                                    >
                                        {s.engagementRate}%
                                        {s.platform === bestEngagement.platform && " 👑"}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Platform Comparison Bars */}
            <div className="section-card">
                <h3>📈 プラットフォーム別パフォーマンスバー</h3>
                {metrics.map((m) => {
                    const maxVal = Math.max(...selected.stats.map((s) => s[m]), 1);
                    return (
                        <div key={m} style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {metricLabels[m]}
                            </div>
                            {selected.stats.map((s) => (
                                <div key={s.platform} className="metric-comparison">
                                    <span style={{ fontSize: 12, width: 70, color: PLATFORM_COLORS[s.platform], fontWeight: 600 }}>
                                        {PLATFORM_LABELS[s.platform]}
                                    </span>
                                    <div className="metric-bar">
                                        <div
                                            className={`metric-bar-fill ${s.platform}`}
                                            style={{ width: `${(s[m] / maxVal) * 100}%` }}
                                        />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600, width: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                                        {formatNumber(s[m])}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
