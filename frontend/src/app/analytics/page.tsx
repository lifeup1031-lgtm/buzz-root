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
import TrendChart from "@/components/TrendChart";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PostData = {
    id: number;
    title: string;
    thumbnail?: string;
    stats: {
        platform: string;
        views: number;
        likes: number;
        saves: number;
        views_1h: number;
        drop_off_rate: number;
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

// Platform-specific drop-off thresholds (data-driven)
const DROP_OFF_THRESHOLDS: Record<string, { safe: number; caution: number }> = {
    youtube: { safe: 30, caution: 40 },
    tiktok: { safe: 30, caution: 50 },
    instagram: { safe: 25, caution: 40 },
};

function formatNumber(num: number): string {
    if (num >= 100_000_000) return (num / 100_000_000).toFixed(1) + "億";
    if (num >= 10_000) return (num / 10_000).toFixed(1) + "万";
    return num.toLocaleString();
}

function calculateSaveRate(saves: number, views: number): string {
    if (views === 0) return "0.0";
    return ((saves / views) * 100).toFixed(1);
}

function calculateVelocity(views1h: number, views: number): string {
    if (views === 0) return "0.0";
    return ((views1h / views) * 100).toFixed(1);
}

function getDropOffDanger(rate: number, platform: string) {
    const thresholds = DROP_OFF_THRESHOLDS[platform] || { safe: 30, caution: 50 };
    if (rate <= thresholds.safe) {
        return { level: "safe", label: "安全", emoji: "🟢", color: "#22c55e", message: "アルゴリズムに好まれやすい状態" };
    } else if (rate <= thresholds.caution) {
        return { level: "caution", label: "注意", emoji: "🟡", color: "#f59e0b", message: "ボーダーライン — 冒頭フックの改善を検討" };
    } else {
        return { level: "danger", label: "危険", emoji: "🔴", color: "#ef4444", message: "アルゴリズムに嫌われるリスク大" };
    }
}

export default function AnalyticsPage() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState<Record<string, unknown>[]>([]);

    // Fetch trend data for selected post
    const fetchTrend = (postId: number) => {
        fetch(`${API_BASE}/api/analytics/trend/${postId}`)
            .then((r) => r.json())
            .then((data) => setTrendData(data.trend || []))
            .catch(() => setTrendData([]));
    };

    useEffect(() => {
        fetch(`${API_BASE}/api/posts`)
            .then((r) => r.json())
            .then((data) => {
                setPosts(data.posts || []);
                if (data.posts?.length > 0) fetchTrend(data.posts[0].id);
                setLoading(false);
            })
            .catch(() => {
                // Mock data
                setPosts([
                    {
                        id: 1, title: "朝のルーティン⏰",
                        stats: [
                            { platform: "youtube", views: 12500, likes: 890, saves: 320, views_1h: 4200, drop_off_rate: 28.5 },
                            { platform: "tiktok", views: 45200, likes: 3400, saves: 1200, views_1h: 18000, drop_off_rate: 22.1 },
                            { platform: "instagram", views: 8900, likes: 1200, saves: 580, views_1h: 3100, drop_off_rate: 35.2 },
                        ],
                    },
                    {
                        id: 2, title: "カフェ巡り☕ in 渋谷",
                        stats: [
                            { platform: "youtube", views: 28300, likes: 2100, saves: 780, views_1h: 8500, drop_off_rate: 35.8 },
                            { platform: "tiktok", views: 56700, likes: 4200, saves: 1500, views_1h: 22000, drop_off_rate: 41.3 },
                            { platform: "instagram", views: 19800, likes: 3100, saves: 1100, views_1h: 7200, drop_off_rate: 22.7 },
                        ],
                    },
                    {
                        id: 3, title: "簡単レシピ🍳 5分パスタ",
                        stats: [
                            { platform: "youtube", views: 35100, likes: 2800, saves: 950, views_1h: 12000, drop_off_rate: 42.1 },
                            { platform: "tiktok", views: 67800, likes: 5100, saves: 1800, views_1h: 28000, drop_off_rate: 18.4 },
                            { platform: "instagram", views: 24500, likes: 3800, saves: 1400, views_1h: 8800, drop_off_rate: 44.6 },
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

    let content;
    if (!selected.stats || selected.stats.length === 0) {
        content = (
            <div className="section-card" style={{ textAlign: "center", padding: 60, color: "var(--color-text-muted)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                この投稿の統計データはまだありません。<br />（予約中・下書き、または公開直後でデータ未収集）
            </div>
        );
    } else {
        const PLATFORM_ORDER = ["youtube", "tiktok", "instagram"] as const;
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
            engagementRate: s.views > 0 ? (((s.likes + s.saves) / s.views) * 100).toFixed(1) : "0.0",
            dropOffDanger: getDropOffDanger(s.drop_off_rate, s.platform),
        }));

        const bestEngagement = analysisData.reduce((a, b) =>
            parseFloat(a.engagementRate) > parseFloat(b.engagementRate) ? a : b
        );

        // Find worst drop-off platform
        const worstDropOff = analysisData.reduce((a, b) =>
            a.drop_off_rate > b.drop_off_rate ? a : b
        );

        content = (
            <>
                {/* Drop-off Alert Cards */}
                <div className="drop-off-grid">
                    {analysisData.map((s) => {
                        const danger = s.dropOffDanger;
                        const thresholds = DROP_OFF_THRESHOLDS[s.platform] || { safe: 30, caution: 50 };
                        return (
                            <div
                                key={s.platform}
                                className={`drop-off-card ${danger.level}`}
                            >
                                <div className="drop-off-card-header">
                                    <span style={{ color: PLATFORM_COLORS[s.platform], fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {PLATFORM_LABELS[s.platform]}
                                    </span>
                                    <span className={`drop-off-badge ${danger.level}`}>
                                        {danger.emoji} {danger.label}
                                    </span>
                                </div>
                                <div className="drop-off-value" style={{ color: danger.color }}>
                                    {s.drop_off_rate}%
                                </div>
                                <div className="drop-off-bar-container">
                                    <div className="drop-off-bar-bg">
                                        <div
                                            className="drop-off-bar-zone safe"
                                            style={{ width: `${thresholds.safe}%` }}
                                        />
                                        <div
                                            className="drop-off-bar-zone caution"
                                            style={{ left: `${thresholds.safe}%`, width: `${thresholds.caution - thresholds.safe}%` }}
                                        />
                                        <div
                                            className="drop-off-bar-zone danger"
                                            style={{ left: `${thresholds.caution}%`, width: `${100 - thresholds.caution}%` }}
                                        />
                                        <div
                                            className="drop-off-bar-needle"
                                            style={{ left: `${Math.min(s.drop_off_rate, 100)}%` }}
                                        />
                                    </div>
                                    <div className="drop-off-bar-labels">
                                        <span>0%</span>
                                        <span>{thresholds.safe}%</span>
                                        <span>{thresholds.caution}%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                                <div className="drop-off-message">{danger.message}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Trend Chart */}
                <TrendChart data={trendData as any} />

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

                {/* Worst Drop-off Warning */}
                {worstDropOff.dropOffDanger.level !== "safe" && (
                    <div
                        style={{
                            padding: "16px 20px",
                            borderRadius: 12,
                            background: worstDropOff.dropOffDanger.level === "danger"
                                ? "rgba(239,68,68,0.1)"
                                : "rgba(245,158,11,0.1)",
                            border: `1px solid ${worstDropOff.dropOffDanger.level === "danger"
                                ? "rgba(239,68,68,0.3)"
                                : "rgba(245,158,11,0.3)"}`,
                            marginBottom: 24,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <span style={{ fontSize: 24 }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: worstDropOff.dropOffDanger.color }}>
                                {PLATFORM_LABELS[worstDropOff.platform]}の冒頭離脱率が{worstDropOff.dropOffDanger.label}水準 ({worstDropOff.drop_off_rate}%)
                            </div>
                            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                                {worstDropOff.dropOffDanger.message}
                            </div>
                        </div>
                    </div>
                )}

                <div className="analytics-grid">
                    {/* Detailed Metrics Table — first */}
                    <div className="section-card">
                        <h3>📋 詳細分析</h3>
                        <table className="video-table">
                            <thead>
                                <tr>
                                    <th>指標</th>
                                    {PLATFORM_ORDER.map((p) => {
                                        const hasData = selected.stats.some(s => s.platform === p);
                                        if (!hasData) return null;
                                        return (
                                            <th key={p} style={{ color: PLATFORM_COLORS[p] }}>
                                                {PLATFORM_LABELS[p]}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map((m) => (
                                    <tr key={m}>
                                        <td style={{ fontWeight: 600, fontSize: 13 }}>{metricLabels[m]}</td>
                                        {PLATFORM_ORDER.map((p) => {
                                            const s = selected.stats.find(st => st.platform === p);
                                            if (!s) return null;
                                            return (
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
                                            );
                                        })}
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>保存率</td>
                                    {PLATFORM_ORDER.map((p) => {
                                        const s = analysisData.find(st => st.platform === p);
                                        if (!s) return null;
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
                                    {PLATFORM_ORDER.map((p) => {
                                        const s = analysisData.find(st => st.platform === p);
                                        if (!s) return null;
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
                                    {PLATFORM_ORDER.map((p) => {
                                        const s = analysisData.find(st => st.platform === p);
                                        if (!s) return null;
                                        return (
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
                                        );
                                    })}
                                </tr>
                                {/* Drop-off rate row */}
                                <tr>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>冒頭離脱率</td>
                                    {PLATFORM_ORDER.map((p) => {
                                        const s = analysisData.find(st => st.platform === p);
                                        if (!s) return null;
                                        const best = analysisData.reduce((a, b) =>
                                            a.drop_off_rate < b.drop_off_rate ? a : b
                                        );
                                        return (
                                            <td
                                                key={s.platform}
                                                style={{
                                                    fontVariantNumeric: "tabular-nums",
                                                    fontWeight: s.platform === best.platform ? 700 : 400,
                                                    color: s.dropOffDanger.color,
                                                }}
                                            >
                                                {s.dropOffDanger.emoji} {s.drop_off_rate}%
                                                {s.platform === best.platform && " 👑"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bar Chart — second */}
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
                                    <Legend
                                        align="center"
                                        verticalAlign="bottom"
                                        content={() => {
                                            const platformsWithData = PLATFORM_ORDER.filter(p => selected.stats.some(s => s.platform === p));
                                            return (
                                                <ul className="recharts-default-legend" style={{ padding: 0, margin: "20px 0 0 0", textAlign: "center", display: "flex", justifyContent: "center", gap: 16 }}>
                                                    {platformsWithData.map((p) => (
                                                        <li key={p} className="recharts-legend-item" style={{ display: "inline-flex", alignItems: "center" }}>
                                                            <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: PLATFORM_COLORS[p], marginRight: 6 }} />
                                                            <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{PLATFORM_LABELS[p]}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            );
                                        }}
                                    />
                                    {PLATFORM_ORDER.filter(p => selected.stats.some(s => s.platform === p)).map(p => (
                                        <Bar
                                            key={p}
                                            dataKey={PLATFORM_LABELS[p]}
                                            fill={PLATFORM_COLORS[p]}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Platform Comparison Bars — including drop-off */}
                <div className="section-card">
                    <h3>📈 プラットフォーム別パフォーマンスバー</h3>
                    {metrics.map((m) => {
                        const maxVal = Math.max(...selected.stats.map((s) => s[m]), 1);
                        return (
                            <div key={m} style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {metricLabels[m]}
                                </div>
                                {PLATFORM_ORDER.map((p) => {
                                    const s = selected.stats.find(st => st.platform === p);
                                    if (!s) return null;
                                    return (
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
                                            <span style={{ fontSize: 13, fontWeight: 600, width: 70, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                                                {formatNumber(s[m])}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }

    return (
        <>
            <div className="page-header">
                <h2>分析</h2>
                <p>プラットフォーム間のパフォーマンスを詳細比較</p>
            </div>

            {/* Current Video Selector Banner */}
            <div className="section-card" style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 60, borderRadius: 6, overflow: "hidden", background: "#333", flexShrink: 0 }}>
                        <img
                            src={selected.thumbnail || `https://api.dicebear.com/7.x/shapes/svg?seed=${selected.id}&backgroundColor=1a1a2e`}
                            alt={selected.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "var(--color-accent)", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 4 }}>
                            現在選択中の動画
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>
                            {selected.title}
                        </div>
                    </div>
                </div>
                <button
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", cursor: "pointer", fontWeight: 600 }}
                >
                    <span style={{ fontSize: 16 }}>🔍</span> 別の動画を選択
                </button>
            </div>

            {content}

            {/* Video Selection Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 800, maxWidth: "90%", background: "#1a1a2e", borderRadius: 16, border: "1px solid var(--color-border)", padding: 24, display: "flex", flexDirection: "column", maxHeight: "80vh" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                                <span>🎥</span> 分析する動画を選択
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", fontSize: 24, cursor: "pointer" }}>✕</button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16, overflowY: "auto", padding: "8px 12px 12px 8px", flex: 1 }}>
                            {posts.map((post, idx) => (
                                <div
                                    key={post.id}
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        background: "rgba(255,255,255,0.03)",
                                        border: idx === selectedIdx ? "2px solid var(--color-accent)" : "1px solid rgba(255,255,255,0.08)",
                                        transition: "0.2s",
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "280px" // Fixed height for consistency
                                    }}
                                    onClick={() => {
                                        setSelectedIdx(idx);
                                        fetchTrend(post.id);
                                        setIsModalOpen(false);
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                        e.currentTarget.style.borderColor = idx === selectedIdx ? "var(--color-accent)" : "rgba(255,255,255,0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                        e.currentTarget.style.borderColor = idx === selectedIdx ? "var(--color-accent)" : "rgba(255,255,255,0.08)";
                                    }}
                                >
                                    <div style={{ width: "100%", height: "200px", background: "#222", position: "relative", flexShrink: 0 }}>
                                        <img
                                            src={post.thumbnail || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.id}&backgroundColor=1a1a2e`}
                                            alt={post.title || "video"}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        {idx === selectedIdx && (
                                            <div style={{ position: "absolute", top: 8, right: 8, background: "var(--color-accent)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 12, zIndex: 10 }}>選択中</div>
                                        )}
                                    </div>
                                    <div style={{ padding: "10px 10px", flex: 1, display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.2)" }}>
                                        <div style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "white",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            lineHeight: "1.4",
                                            marginBottom: 4
                                        }}>
                                            {post.title || "無題の動画"}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: "auto" }}>
                                            再生: {formatNumber((post.stats || []).reduce((acc, s) => acc + s.views, 0))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


        </>
    );
}
