"use client";

type PlatformCardProps = {
    platform: "youtube" | "tiktok" | "instagram";
    views: number;
    likes: number;
    saves: number;
    highlights: {
        views: string;
        likes: string;
        saves: string;
    };
};

const platformIcons: Record<string, string> = {
    youtube: "▶️",
    tiktok: "♪",
    instagram: "📷",
};

const platformNames: Record<string, string> = {
    youtube: "YouTube Shorts",
    tiktok: "TikTok",
    instagram: "Instagram Reels",
};

function formatNumber(num: number): string {
    if (num >= 100_000_000) return (num / 100_000_000).toFixed(1) + "億";
    if (num >= 10_000) return (num / 10_000).toFixed(1) + "万";
    return num.toLocaleString();
}

export default function PlatformCard({
    platform,
    views,
    likes,
    saves,
    highlights,
}: PlatformCardProps) {
    return (
        <div className={`kpi-card ${platform}`}>
            <div className="kpi-card-header">
                <span className="kpi-platform-name">{platformNames[platform]}</span>
                <div className="kpi-platform-icon">{platformIcons[platform]}</div>
            </div>
            <div className="kpi-metrics">
                <div className="kpi-metric">
                    <span className="kpi-metric-label">再生数</span>
                    <span className={`kpi-metric-value ${highlights.views === platform ? "highlight" : ""}`}>
                        {formatNumber(views)}
                    </span>
                </div>
                <div className="kpi-metric">
                    <span className="kpi-metric-label">いいね</span>
                    <span className={`kpi-metric-value ${highlights.likes === platform ? "highlight" : ""}`}>
                        {formatNumber(likes)}
                    </span>
                </div>
                <div className="kpi-metric">
                    <span className="kpi-metric-label">保存数</span>
                    <span className={`kpi-metric-value ${highlights.saves === platform ? "highlight" : ""}`}>
                        {formatNumber(saves)}
                    </span>
                </div>
            </div>
        </div>
    );
}
