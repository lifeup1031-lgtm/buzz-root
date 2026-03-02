"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AuthStatus = {
    youtube: boolean;
    tiktok: boolean;
    instagram: boolean;
};

export default function SettingsPage() {
    const [status, setStatus] = useState<AuthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/status`);
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleConnect = async (platform: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/login/${platform}`);
            if (!res.ok) throw new Error("API route failed");
            const data = await res.json();
            if (data.auth_url) {
                // In an actual scenario, this redirects to Google/TikTok/Meta consent screens
                window.location.href = data.auth_url;
            }
        } catch (err) {
            console.error(err);
            showToast("連携の開始に失敗しました");
        }
    };

    const platforms = [
        {
            id: "youtube",
            name: "YouTube Shorts",
            icon: "▶️",
            color: "var(--color-youtube)",
            desc: "Googleアカウント経由でYouTubeチャンネルに接続します",
            connected: status?.youtube || false,
        },
        {
            id: "tiktok",
            name: "TikTok",
            icon: "♪",
            color: "var(--color-tiktok)",
            desc: "TikTokアカウントに接続して動画を直接投稿できるようにします",
            connected: status?.tiktok || false,
        },
        {
            id: "instagram",
            name: "Instagram Reels",
            icon: "📷",
            color: "var(--color-instagram)",
            desc: "Facebook連携済みのInstagramプロフェッショナルアカウントに接続します",
            connected: status?.instagram || false,
        },
    ];

    if (loading) return <div className="loading">読み込み中...</div>;

    return (
        <div style={{ padding: "0" }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <h2>設定・アカウント連携</h2>
                <p>各SNSプラットフォームとのAPI連携や基本設定を行います</p>
            </div>

            <div className="section-card" style={{ marginBottom: 32 }}>
                <h3 style={{ marginBottom: 20 }}>🔗 SNSアカウント連携</h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 24 }}>
                    動画を直接公開するために、各SNSプラットフォームとのOAuth連携を行います。
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {platforms.map(p => (
                        <div key={p.id} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "20px",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: 12,
                            border: `1px solid ${p.connected ? p.color : "var(--color-border)"}`
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    background: `rgba(${p.id === 'youtube' ? '255,0,51' : p.id === 'tiktok' ? '0,242,234' : '193,53,132'}, 0.1)`,
                                    color: p.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 24
                                }}>
                                    {p.icon}
                                </div>
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                        {p.name}
                                        {p.connected && (
                                            <span style={{ fontSize: 11, background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>連携済み</span>
                                        )}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>{p.desc}</p>
                                </div>
                            </div>
                            <div>
                                {p.connected ? (
                                    <button
                                        style={{
                                            padding: "8px 16px",
                                            background: "transparent",
                                            color: "var(--color-text-muted)",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            fontWeight: 600
                                        }}
                                        onClick={() => showToast("現在連携の解除は未実装です")}
                                    >
                                        連携を解除
                                    </button>
                                ) : (
                                    <button
                                        className="btn-primary"
                                        style={{ background: p.color }}
                                        onClick={() => handleConnect(p.id)}
                                    >
                                        連携する
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div style={{ position: "fixed", bottom: 20, right: 20, background: "var(--color-surface)", border: "1px solid var(--color-accent)", padding: "12px 20px", borderRadius: 8, zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.5)", fontWeight: 600 }}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
