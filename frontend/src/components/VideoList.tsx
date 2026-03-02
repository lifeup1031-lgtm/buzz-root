"use client";

type VideoItem = {
    id: number;
    title: string;
    hashtags: string;
    created_at: string;
    stats: {
        platform: string;
        views: number;
        likes: number;
        saves: number;
    }[];
};

const videoEmojis = ["🎬", "🎥", "📱", "🎞️", "🎭"];

function formatNumber(num: number): string {
    if (num >= 100_000_000) return (num / 100_000_000).toFixed(1) + "億";
    if (num >= 10_000) return (num / 10_000).toFixed(1) + "万";
    return num.toLocaleString();
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export default function VideoList({
    videos,
    onSelect,
    selectedId,
}: {
    videos: VideoItem[];
    onSelect: (id: number) => void;
    selectedId: number | null;
}) {
    return (
        <table className="video-table">
            <thead>
                <tr>
                    <th>動画</th>
                    <th>プラットフォーム</th>
                    <th>総再生数</th>
                    <th>投稿日</th>
                </tr>
            </thead>
            <tbody>
                {videos.map((video, idx) => {
                    const totalViews = video.stats.reduce((sum, s) => sum + s.views, 0);
                    return (
                        <tr
                            key={video.id}
                            onClick={() => onSelect(video.id)}
                            style={{
                                cursor: "pointer",
                                background: selectedId === video.id ? "rgba(99,102,241,0.1)" : undefined,
                            }}
                        >
                            <td>
                                <div className="video-title-cell">
                                    <div className="video-thumb">
                                        {videoEmojis[idx % videoEmojis.length]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{video.title}</div>
                                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                                            {video.hashtags.split(",").slice(0, 3).join(" ")}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {video.stats.map((s) => (
                                        <span key={s.platform} className={`platform-badge ${s.platform}`}>
                                            {s.platform === "youtube" ? "YT" : s.platform === "tiktok" ? "TT" : "IG"}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                                {formatNumber(totalViews)}
                            </td>
                            <td style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                                {formatDate(video.created_at)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
