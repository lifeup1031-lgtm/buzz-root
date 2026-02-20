"use client";
import { useState } from "react";

type Props = {
    videoUrl: string | null;
    title: string;
};

function PhoneFrame({
    children,
    platform,
    label,
    onClick,
}: {
    children: React.ReactNode;
    platform: string;
    label: string;
    onClick?: () => void;
}) {
    return (
        <div
            className="preview-phone"
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : undefined }}
        >
            <span className={`preview-label ${platform}`}>{label}</span>
            {children}
        </div>
    );
}

function VideoBackground({ videoUrl, fallbackGradient, fallbackEmoji }: { videoUrl: string | null; fallbackGradient: string; fallbackEmoji: string }) {
    return videoUrl ? (
        <video src={videoUrl} muted loop playsInline autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
        <div style={{ width: "100%", height: "100%", background: fallbackGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
            {fallbackEmoji}
        </div>
    );
}

/* ====== YouTube Shorts Overlay ====== */
function YouTubeOverlay({ title }: { title: string }) {
    return (
        <div className="preview-overlay">
            <div className="safety-zone" style={{ top: "12%", left: "8%", right: "18%", bottom: "25%" }} />
            <div style={{ position: "absolute", right: 10, bottom: 90, display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                {[
                    { icon: "👍", label: "1.2K" },
                    { icon: "👎", label: "" },
                    { icon: "💬", label: "89" },
                    { icon: "↗️", label: "共有" },
                    { icon: "⋯", label: "" },
                ].map((item, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "white", fontSize: 9 }}>
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        {item.label && <span>{item.label}</span>}
                    </div>
                ))}
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 14px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ff0033", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", fontWeight: 700 }}>Y</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>@your_channel</span>
                    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "#ff0033", color: "white", fontWeight: 700 }}>登録</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "white", marginBottom: 4, lineHeight: 1.4 }}>{title || "タイトル未入力"}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>♪</span>
                    <span>オリジナル音源 — your_channel</span>
                </div>
            </div>
        </div>
    );
}

/* ====== TikTok Overlay ====== */
function TikTokOverlay({ title }: { title: string }) {
    return (
        <div className="preview-overlay">
            <div className="safety-zone" style={{ top: "10%", left: "5%", right: "18%", bottom: "22%" }} />
            <div style={{ position: "absolute", right: 8, bottom: 90, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
                <div style={{ position: "relative", marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #25f4ee, #fe2c55)", border: "2px solid white" }} />
                    <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#fe2c55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white" }}>+</div>
                </div>
                {[
                    { icon: "❤️", label: "3.4K" },
                    { icon: "💬", label: "156" },
                    { icon: "🔖", label: "89" },
                    { icon: "↗️", label: "23" },
                ].map((item, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "white", fontSize: 9 }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                    </div>
                ))}
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #333, #000)", border: "3px solid #444" }} />
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 60, padding: "40px 14px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 6 }}>@your_account</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", marginBottom: 6, lineHeight: 1.4 }}>
                    {title || "タイトル未入力"} <span style={{ color: "#69c9d0" }}>#fyp #おすすめ</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    <span>♪</span>
                    <span style={{ overflow: "hidden", whiteSpace: "nowrap" }}>オリジナル楽曲 — your_account</span>
                </div>
            </div>
        </div>
    );
}

/* ====== Instagram Reels Overlay ====== */
function InstagramOverlay({ title }: { title: string }) {
    return (
        <div className="preview-overlay">
            <div className="safety-zone" style={{ top: "8%", left: "5%", right: "16%", bottom: "22%" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(rgba(0,0,0,0.5), transparent)" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>リール</span>
                <span style={{ fontSize: 18, color: "white" }}>📷</span>
            </div>
            <div style={{ position: "absolute", right: 10, bottom: 90, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
                {[
                    { icon: "❤️", label: "2.1K" },
                    { icon: "💬", label: "73" },
                    { icon: "↗️", label: "" },
                    { icon: "🔖", label: "" },
                    { icon: "⋯", label: "" },
                ].map((item, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "white", fontSize: 9 }}>
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        {item.label && <span style={{ fontWeight: 600 }}>{item.label}</span>}
                    </div>
                ))}
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af)", border: "2px solid white" }} />
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 56, padding: "40px 14px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af)", border: "2px solid white" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>your_account</span>
                    <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 6, border: "1px solid white", color: "white", fontWeight: 600 }}>フォロー</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>
                    {title || "タイトル未入力"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                    <span>♪</span>
                    <span>your_account · オリジナル音源</span>
                </div>
            </div>
        </div>
    );
}

/* ====== Modal ====== */
function PreviewModal({
    platform,
    videoUrl,
    title,
    onClose,
}: {
    platform: "youtube" | "tiktok" | "instagram";
    videoUrl: string | null;
    title: string;
    onClose: () => void;
}) {
    const configs = {
        youtube: { label: "YouTube Shorts", gradient: "linear-gradient(135deg, #1a0000, #330011)", emoji: "▶️", Overlay: YouTubeOverlay },
        tiktok: { label: "TikTok", gradient: "linear-gradient(135deg, #000a0a, #001a1a)", emoji: "♪", Overlay: TikTokOverlay },
        instagram: { label: "Instagram Reels", gradient: "linear-gradient(135deg, #1a0015, #2a0020)", emoji: "📷", Overlay: InstagramOverlay },
    };

    const config = configs[platform];

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                cursor: "pointer",
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(360px, 90vw)",
                    aspectRatio: "9/16",
                    position: "relative",
                    borderRadius: 24,
                    overflow: "hidden",
                    border: "2px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    cursor: "default",
                }}
            >
                <span className={`preview-label ${platform}`}>{config.label}</span>
                <VideoBackground videoUrl={videoUrl} fallbackGradient={config.gradient} fallbackEmoji={config.emoji} />
                <config.Overlay title={title} />
            </div>
            <div style={{ position: "absolute", top: 24, right: 32, color: "rgba(255,255,255,0.6)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>ESC または背景クリックで閉じる</span>
                <span style={{ fontSize: 24, cursor: "pointer" }} onClick={onClose}>✕</span>
            </div>
        </div>
    );
}

/* ====== Main Component ====== */
export default function SafetyZonePreview({ videoUrl, title }: Props) {
    const [modalPlatform, setModalPlatform] = useState<"youtube" | "tiktok" | "instagram" | null>(null);

    return (
        <>
            <div className="preview-container">
                <PhoneFrame platform="youtube" label="YouTube Shorts" onClick={() => setModalPlatform("youtube")}>
                    <VideoBackground videoUrl={videoUrl} fallbackGradient="linear-gradient(135deg, #1a0000, #330011)" fallbackEmoji="▶️" />
                    <YouTubeOverlay title={title} />
                    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "rgba(255,255,255,0.5)", background: "rgba(0,0,0,0.5)", padding: "3px 10px", borderRadius: 12 }}>
                        タップで拡大 🔍
                    </div>
                </PhoneFrame>

                <PhoneFrame platform="tiktok" label="TikTok" onClick={() => setModalPlatform("tiktok")}>
                    <VideoBackground videoUrl={videoUrl} fallbackGradient="linear-gradient(135deg, #000a0a, #001a1a)" fallbackEmoji="♪" />
                    <TikTokOverlay title={title} />
                    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "rgba(255,255,255,0.5)", background: "rgba(0,0,0,0.5)", padding: "3px 10px", borderRadius: 12 }}>
                        タップで拡大 🔍
                    </div>
                </PhoneFrame>

                <PhoneFrame platform="instagram" label="Instagram Reels" onClick={() => setModalPlatform("instagram")}>
                    <VideoBackground videoUrl={videoUrl} fallbackGradient="linear-gradient(135deg, #1a0015, #2a0020)" fallbackEmoji="📷" />
                    <InstagramOverlay title={title} />
                    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "rgba(255,255,255,0.5)", background: "rgba(0,0,0,0.5)", padding: "3px 10px", borderRadius: 12 }}>
                        タップで拡大 🔍
                    </div>
                </PhoneFrame>
            </div>

            {modalPlatform && (
                <PreviewModal
                    platform={modalPlatform}
                    videoUrl={videoUrl}
                    title={title}
                    onClose={() => setModalPlatform(null)}
                />
            )}
        </>
    );
}
