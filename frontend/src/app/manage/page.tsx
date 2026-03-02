"use client";
import { useState, useEffect } from "react";
import DateTimePicker from "@/components/DateTimePicker";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Post = {
    id: number;
    title: string;
    description: string;
    video_path: string;
    created_at: string;
    scheduled_at: string | null;
    status: "published" | "scheduled" | "draft";
    stats: any[];
};

type QueueResponse = {
    queue: {
        published: Post[];
        scheduled: Post[];
        draft: Post[];
    };
    counts: {
        published: number;
        scheduled: number;
        draft: number;
        all: number;
    };
};

type Tab = "all" | "scheduled" | "published" | "draft";

export default function ManagePage() {
    const [data, setData] = useState<QueueResponse | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: "publish" | "delete", postId: number } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/posts/queue`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDelete = async (postId: number) => {
        try {
            await fetch(`${API_BASE}/api/posts/${postId}`, { method: "DELETE" });
            fetchData();
            showToast("🗑️ 削除完了しました");
        } catch (err) {
            console.error(err);
            showToast("⚠️ 削除に失敗しました");
        }
        setConfirmAction(null);
    };

    const handlePublishNow = async (postId: number) => {
        try {
            const fd = new FormData();
            fd.append("status", "published");
            const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
                method: "PATCH",
                body: fd,
            });
            if (res.ok) {
                fetchData();
                showToast("🚀 今すぐ投稿を完了しました！");
            } else {
                showToast("⚠️ 投稿に失敗しました");
            }
        } catch (err) {
            console.error(err);
            showToast("⚠️ 通信エラーが発生しました");
        }
        setConfirmAction(null);
    };

    const handleEditSave = async (id: number, title: string, desc: string, scheduledAt: string | null) => {
        try {
            const fd = new FormData();
            fd.append("title", title);
            fd.append("description", desc);
            if (scheduledAt) {
                fd.append("scheduled_at", scheduledAt);
                fd.append("status", "scheduled");
            } else {
                fd.append("scheduled_at", ""); // Clear date
            }
            const res = await fetch(`${API_BASE}/api/posts/${id}`, {
                method: "PATCH",
                body: fd,
            });
            if (res.ok) {
                fetchData();
                setEditingPost(null);
                showToast("✅ 変更を保存しました");
            } else {
                showToast("⚠️ 保存に失敗しました");
            }
        } catch (err) {
            console.error(err);
            showToast("⚠️ エラーが発生しました");
        }
    };

    if (loading) return <div className="loading">読み込み中...</div>;
    if (!data) return <div className="error">データが取得できませんでした</div>;

    // Filter posts
    let displayPosts: Post[] = [];
    if (activeTab === "all") {
        displayPosts = [...data.queue.scheduled, ...data.queue.draft, ...data.queue.published];
    } else {
        displayPosts = data.queue[activeTab] || [];
    }

    // Sort: Scheduled first (by date), then by created_at desc
    displayPosts.sort((a, b) => {
        if (a.status === "scheduled" && b.status === "scheduled") {
            return new Date(a.scheduled_at || "").getTime() - new Date(b.scheduled_at || "").getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const tabs: { key: Tab; label: string; count: number; icon: string }[] = [
        { key: "all", label: "すべて", count: data.counts.all || 0, icon: "📋" },
        { key: "scheduled", label: "予約済み", count: data.counts.scheduled || 0, icon: "📅" },
        { key: "published", label: "公開済み", count: data.counts.published || 0, icon: "✅" },
        { key: "draft", label: "下書き", count: data.counts.draft || 0, icon: "✏️" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
            <div className="page-header" style={{ flexShrink: 0 }}>
                <h2>投稿管理</h2>
                <p>予約中の動画や公開済みの動画を管理します</p>
            </div>

            {/* Tabs */}
            <div className="manage-tabs" style={{ flexShrink: 0, display: "flex", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`manage-tab ${activeTab === tab.key ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 20,
                            border: "none",
                            background: activeTab === tab.key ? "var(--color-accent)" : "var(--color-surface)",
                            color: activeTab === tab.key ? "white" : "var(--color-text)",
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            whiteSpace: "nowrap"
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        <span style={{
                            background: activeTab === tab.key ? "rgba(0,0,0,0.2)" : "var(--color-bg)",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 12
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="manage-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {displayPosts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)", background: "var(--color-surface)", borderRadius: 12 }}>
                        投稿がありません
                    </div>
                ) : (
                    displayPosts.map(post => {
                        const isScheduled = post.status === "scheduled";
                        const pubDate = isScheduled && post.scheduled_at ? new Date(post.scheduled_at) : new Date(post.created_at);
                        const dateStr = pubDate.toLocaleString("ja-JP", {
                            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        });

                        return (
                            <div key={post.id} className="manage-card" style={{
                                display: "flex",
                                background: "var(--color-surface)",
                                borderRadius: 12,
                                border: `1px solid ${isScheduled ? "rgba(0,242,234,0.3)" : "var(--color-border)"}`,
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    width: 120,
                                    background: "rgba(0,0,0,0.5)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 32
                                }}>
                                    {post.status === "draft" ? "📝" : "🎬"}
                                </div>
                                <div style={{ padding: 16, flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                {post.status === "scheduled" && <span style={{ background: "rgba(0,242,234,0.2)", color: "var(--color-tiktok)", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>予約済み</span>}
                                                {post.status === "published" && <span style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>公開済み</span>}
                                                {post.status === "draft" && <span style={{ background: "rgba(100,100,100,0.2)", color: "#aaa", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>下書き</span>}

                                                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                                    {isScheduled ? `📅 ${dateStr} に投稿予定` : `${dateStr} 作成`}
                                                </span>
                                            </div>
                                            <h3 style={{ margin: 0, fontSize: 16 }}>{post.title}</h3>
                                        </div>

                                        <div style={{ display: "flex", gap: 8 }}>
                                            {isScheduled && (
                                                <button
                                                    onClick={() => setConfirmAction({ type: "publish", postId: post.id })}
                                                    style={{ background: "var(--color-accent)", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                                                >
                                                    🚀 今すぐ投稿
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingPost(post)}
                                                style={{ background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                                            >
                                                ✏️ 編集
                                            </button>
                                            <button
                                                className="manage-delete-btn"
                                                onClick={() => setConfirmAction({ type: "delete", postId: post.id })}
                                                style={{ background: "transparent", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 12px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {post.description || "説明なし"}
                                    </p>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {/* Mocking platform icons since we don't have per-post platform breakdown yet, 
                                            but we can extract from stats if published */}
                                        {post.status === "published" && post.stats.map(s => (
                                            <span key={s.platform} style={{
                                                fontSize: 12,
                                                padding: "2px 6px",
                                                borderRadius: 4,
                                                background: "rgba(255,255,255,0.05)",
                                                color: `var(--color-${s.platform})`
                                            }}>
                                                {s.platform === "youtube" ? "▶️ YouTube" : s.platform === "tiktok" ? "♪ TikTok" : "📷 Instagram"}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div style={{ position: "fixed", bottom: 20, right: 20, background: "var(--color-surface)", border: "1px solid var(--color-accent)", padding: "12px 20px", borderRadius: 8, zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.5)", fontWeight: 600 }}>
                    {toastMessage}
                </div>
            )}

            {/* Edit Modal */}
            {editingPost && (
                <EditPostModal
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onSave={(title, desc, scheduledAt) => handleEditSave(editingPost.id, title, desc, scheduledAt)}
                />
            )}

            {/* Confirm Modal */}
            {confirmAction && (
                <ConfirmModal
                    title={confirmAction.type === "publish" ? "🚀 今すぐ投稿" : "🗑️ 投稿の削除"}
                    message={confirmAction.type === "publish" ? "この動画を今すぐ全プラットフォームへ投稿しますか？" : "この投稿を完全に削除しますか？この操作は取り消せません。"}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={() => {
                        if (confirmAction.type === "publish") handlePublishNow(confirmAction.postId);
                        else handleDelete(confirmAction.postId);
                    }}
                    danger={confirmAction.type === "delete"}
                />
            )}
        </div>
    );
}

function ConfirmModal({ title, message, onClose, onConfirm, danger }: { title: string, message: string, onClose: () => void, onConfirm: () => void, danger?: boolean }) {
    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div style={{ background: "var(--color-bg)", width: "90%", maxWidth: 400, borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <h3 style={{ margin: "0 0 12px 0", fontSize: 18 }}>{title}</h3>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{message}</p>
                </div>
                <div style={{ display: "flex", borderTop: "1px solid var(--color-border)" }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: "16px", background: "transparent", border: "none", color: "var(--color-text)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: "16px",
                            background: danger ? "#ef4444" : "var(--color-accent)",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 600,
                            borderLeft: "1px solid var(--color-border)"
                        }}
                    >
                        確定する
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditPostModal({ post, onClose, onSave }: { post: Post, onClose: () => void, onSave: (title: string, desc: string, scheduledAt: string | null) => void }) {
    const [title, setTitle] = useState(post.title || "");
    const [desc, setDesc] = useState(post.description || "");
    const initialDate = post.scheduled_at ? post.scheduled_at.split("T")[0] : "";
    const initialTime = post.scheduled_at ? post.scheduled_at.split("T")[1].substring(0, 5) : "12:00";
    const [isScheduled, setIsScheduled] = useState(post.status === "scheduled" || post.status === "draft");
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let scheduledAtStr = null;
        if (isScheduled && date && time) {
            scheduledAtStr = `${date}T${time}:00`;
        }
        onSave(title, desc, scheduledAtStr);
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div style={{ background: "var(--color-bg)", width: "90%", maxWidth: 500, borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>✏️ 投稿を編集</h3>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "var(--color-text-muted)" }}>タイトル</label>
                        <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "var(--color-text-muted)" }}>説明文</label>
                        <textarea className="form-input" rows={4} value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                            <input type="checkbox" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--color-accent)" }} />
                            <span>日時を予約する (ステータスが変わります)</span>
                        </label>
                        {isScheduled && (
                            <div style={{ marginTop: 12, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                                <DateTimePicker date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>キャンセル</button>
                        <button type="submit" className="btn-primary">変更を保存</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
