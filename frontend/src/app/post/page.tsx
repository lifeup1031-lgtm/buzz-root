"use client";
import { useState, useRef } from "react";
import SafetyZonePreview from "@/components/SafetyZonePreview";

const API_BASE = "http://localhost:8000";

export default function PostPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [platforms, setPlatforms] = useState({
        youtube: true,
        tiktok: true,
        instagram: true,
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("video/")) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
        }
    };

    const togglePlatform = (p: keyof typeof platforms) => {
        setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile) return;

        setSubmitting(true);
        setResult(null);

        const selectedPlatforms = Object.entries(platforms)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(",");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("hashtags", hashtags);
        formData.append("platforms", selectedPlatforms);
        formData.append("video", videoFile);

        try {
            const res = await fetch(`${API_BASE}/api/posts`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setResult(`✅ 投稿が作成されました！ (ID: ${data.post?.id})`);
            setTitle("");
            setDescription("");
            setHashtags("");
            setVideoFile(null);
            setVideoUrl(null);
        } catch {
            setResult("⚠️ バックエンドに接続できません。デモモードで動作中です。");
        }
        setSubmitting(false);
    };

    return (
        <>
            <div className="page-header">
                <h2>一括投稿</h2>
                <p>1つの動画を複数プラットフォームに同時投稿</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                    <form className="post-form" onSubmit={handleSubmit}>
                        {/* Upload Zone */}
                        <div
                            className={`upload-zone ${videoFile ? "has-file" : ""}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                            <div className="upload-zone-icon">{videoFile ? "✅" : "📤"}</div>
                            <div className="upload-zone-text">
                                {videoFile ? (
                                    <span>{videoFile.name}</span>
                                ) : (
                                    <>
                                        <strong>クリックまたはドラッグ&ドロップ</strong>で動画をアップロード
                                        <br />
                                        <span style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                                            9:16 推奨 · 最大60秒
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label>タイトル</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="例: 朝のルーティン⏰"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label>説明文</label>
                            <textarea
                                className="form-input"
                                placeholder="動画の説明を入力..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Hashtags */}
                        <div className="form-group">
                            <label>ハッシュタグ</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="#vlog, #日常, #routine"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                            />
                        </div>

                        {/* Platform Selection */}
                        <div className="form-group">
                            <label>投稿先プラットフォーム</label>
                            <div className="platform-checks">
                                <div
                                    className={`platform-check ${platforms.youtube ? "checked" : ""}`}
                                    onClick={() => togglePlatform("youtube")}
                                >
                                    <span style={{ color: "var(--color-youtube)" }}>▶️</span>
                                    YouTube Shorts
                                </div>
                                <div
                                    className={`platform-check ${platforms.tiktok ? "checked" : ""}`}
                                    onClick={() => togglePlatform("tiktok")}
                                >
                                    <span style={{ color: "var(--color-tiktok)" }}>♪</span>
                                    TikTok
                                </div>
                                <div
                                    className={`platform-check ${platforms.instagram ? "checked" : ""}`}
                                    onClick={() => togglePlatform("instagram")}
                                >
                                    <span style={{ color: "var(--color-instagram)" }}>📷</span>
                                    Instagram
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button className="btn-primary" type="submit" disabled={submitting || !videoFile}>
                            {submitting ? "投稿中..." : "🚀 一括投稿する"}
                        </button>

                        {result && (
                            <div
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    background: result.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                                    border: `1px solid ${result.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                                    fontSize: 14,
                                }}
                            >
                                {result}
                            </div>
                        )}
                    </form>
                </div>

                {/* Preview */}
                <div>
                    <div className="section-card">
                        <h3>👁️ セーフティゾーン プレビュー</h3>
                        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 16 }}>
                            黄色の点線が「安全領域」— この中にテキストや重要な要素を配置してください
                        </p>
                        <SafetyZonePreview videoUrl={videoUrl} title={title} />
                    </div>
                </div>
            </div>
        </>
    );
}
