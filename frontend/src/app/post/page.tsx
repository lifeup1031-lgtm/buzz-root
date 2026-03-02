"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import DateTimePicker from "@/components/DateTimePicker";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

type VideoItem = {
    id: string;
    file: File;
    url: string;
    title: string;
    description: string;
    hashtags: string;
    isKidsContent: boolean;
    igShareToFeed: boolean;
    thumbnailFile?: File;
    thumbnailUrl?: string;
    generatedFrames?: string[]; // Kept for the filmstrip background
};

/** Thumbnail Editor Modal */
function ThumbnailEditorModal({
    video,
    onClose,
    onSelect
}: {
    video: VideoItem;
    onClose: () => void;
    onSelect: (file: File, url: string) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const handleConfirm = () => {
        if (!videoRef.current || !canvasRef.current || duration < 1) return;
        const v = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            const file = dataURLtoFile(dataUrl, `thumb_${video.id}_custom.jpg`);
            onSelect(file, dataUrl);
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div style={{ width: "90%", maxWidth: 600, background: "var(--color-bg)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--color-border)" }}>

                {/* Header */}
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)" }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>サムネイルを選択</h3>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                </div>

                {/* Video Preview */}
                <div style={{ position: "relative", width: "100%", background: "#000", display: "flex", justifyContent: "center", padding: "20px 0" }}>
                    <video
                        ref={videoRef}
                        src={video.url}
                        style={{ height: 360, maxWidth: "100%", objectFit: "contain", borderRadius: 8 }}
                        onLoadedMetadata={handleLoadedMetadata}
                        playsInline
                        muted
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>

                {/* Controls */}
                <div style={{ padding: "20px" }}>
                    <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 12, textAlign: "center" }}>
                        スライダーを動かして動画からサムネイルにしたいシーンを選んでください
                    </div>

                    {/* Scrubber Container */}
                    <div style={{ position: "relative", width: "100%", height: 60, background: "rgba(255,255,255,0.05)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                        {/* Filmstrip Background */}
                        {video.generatedFrames && video.generatedFrames.length > 0 && (
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex" }}>
                                {video.generatedFrames.map((frame, i) => (
                                    <div key={i} style={{ flex: 1, height: "100%", backgroundImage: `url(${frame})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.5 }} />
                                ))}
                            </div>
                        )}
                        {/* Custom Range Slider Over Filmstrip */}
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step={0.01}
                            value={currentTime}
                            onChange={handleSeek}
                            style={{
                                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", margin: 0,
                                opacity: 1, cursor: "ew-resize",
                                appearance: "none", background: "transparent",
                                zIndex: 10
                            }}
                            className="scrubber-slider"
                        />
                        {/* Playhead indicator */}
                        {duration > 0 && (
                            <div style={{
                                position: "absolute", top: 0, left: `calc(${(currentTime / duration) * 100}% - 2px)`,
                                width: 4, height: "100%", background: "var(--color-accent)", zIndex: 5, pointerEvents: "none",
                                boxShadow: "0 0 8px var(--color-accent)"
                            }} />
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>キャンセル</button>
                        <button type="button" className="btn-primary" onClick={handleConfirm}>
                            ✓ このシーンに決定
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function PostPage() {
    // Multi-video queue
    const [videoQueue, setVideoQueue] = useState<VideoItem[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);

    // Schedule mode
    const [scheduleMode, setScheduleMode] = useState<"now" | "scheduled">("now");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("12:00");

    // Platform & Channel selection
    const CHANNELS = {
        youtube: [
            { id: "yt1", name: "そうえい", handle: "@souei_main", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=souei1&backgroundColor=ffdfbf" },
            { id: "yt2", name: "そうえい - ショート", handle: "@souei_shorts", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=souei2&backgroundColor=c0aede" },
            { id: "yt3", name: "Tech Talk Channel", handle: "@techtalk_jp", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tech&backgroundColor=b6e3f4" },
            { id: "yt4", name: "Vlog.inc", handle: "@vlog_inc_official", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Vlog" }
        ],
        tiktok: [
            { id: "tt1", name: "そうえい", handle: "@souei_official", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=souei3&backgroundColor=b6e3f4" },
            { id: "tt2", name: "そうえい日常", handle: "@souei_daily", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=souei4&backgroundColor=ffdfbf" },
            { id: "tt3", name: "ガジェット紹介 / Tech Talk", handle: "@techtalk_tiktok", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=techtt&backgroundColor=b6e3f4" },
        ],
        instagram: [
            { id: "ig1", name: "そうえい", handle: "souei.gram", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=souei5&backgroundColor=f1d4b3" },
            { id: "ig2", name: "そうえい (サブ)", handle: "souei.sub", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=souei6&backgroundColor=c0aede" },
            { id: "ig3", name: "Tech Talk JP", handle: "techtalk.jp", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=techig&backgroundColor=b6e3f4" },
            { id: "ig4", name: "Meme Collection", handle: "meme_colle", avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=meme" },
        ]
    };

    const [platforms, setPlatforms] = useState({
        youtube: true,
        tiktok: true,
        instagram: true,
    });

    const [selectedChannels, setSelectedChannels] = useState({
        youtube: "yt1",
        tiktok: "tt1",
        instagram: "ig1",
    });

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const [showThumbEditor, setShowThumbEditor] = useState(false); // <--- State for Modal

    const activeVideo = videoQueue[activeIdx] || null;

    useEffect(() => {
        const generateFramesForVideo = async (idx: number, file: File) => {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.playsInline = true;

            await new Promise((resolve) => {
                video.addEventListener("loadedmetadata", resolve, { once: true });
            });

            if (video.duration < 1) return;

            const numFrames = 6;
            const duration = video.duration;
            const interval = duration / (numFrames + 1);
            const frames: string[] = [];

            for (let i = 1; i <= numFrames; i++) {
                video.currentTime = interval * i;
                await new Promise((resolve) => {
                    video.addEventListener("seeked", resolve, { once: true });
                });
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL("image/jpeg", 0.6));
                }
            }
            URL.revokeObjectURL(video.src);
            updateVideo(idx, "generatedFrames", frames);
        };

        if (activeVideo && !activeVideo.generatedFrames) {
            updateVideo(activeIdx, "generatedFrames", []);
            generateFramesForVideo(activeIdx, activeVideo.file).catch(console.error);
        }
    }, [activeVideo, activeIdx]);

    const addVideo = (file: File) => {
        const item: VideoItem = {
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
            title: "",
            description: "",
            hashtags: "",
            isKidsContent: false,
            igShareToFeed: true,
        };
        setVideoQueue((prev) => [...prev, item]);
        setActiveIdx(videoQueue.length); // Switch to newly added
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(addVideo);
        }
        // Reset so same file can be selected again
        e.target.value = "";
    };

    const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateVideo(activeIdx, "thumbnailFile", file);
            updateVideo(activeIdx, "thumbnailUrl", URL.createObjectURL(file));
        }
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        Array.from(files)
            .filter((f) => f.type.startsWith("video/"))
            .forEach(addVideo);
    };

    const updateVideo = useCallback((idx: number, field: keyof VideoItem, value: any) => {
        setVideoQueue((prev) =>
            prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
        );
    }, []);

    const removeVideo = (idx: number) => {
        setVideoQueue((prev) => prev.filter((_, i) => i !== idx));
        if (activeIdx >= videoQueue.length - 1) {
            setActiveIdx(Math.max(0, videoQueue.length - 2));
        }
    };

    const togglePlatform = (p: keyof typeof platforms) => {
        setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }));
    };

    const setChannel = (p: keyof typeof selectedChannels, val: string) => {
        setSelectedChannels((prev) => ({ ...prev, [p]: val }));
        setOpenDropdown(null);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // .channel-selector-container の外でのクリックならドロップダウンを閉じる
            if (!target.closest(".channel-selector-container")) {
                setOpenDropdown(null);
            }
        };
        // clickイベントに揃えてタイミングのズレを防ぐ
        document.addEventListener("click", handleClickOutside, { capture: true });
        return () => document.removeEventListener("click", handleClickOutside, { capture: true });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (videoQueue.length === 0) return;

        setSubmitting(true);
        setResults([]);

        const selectedPlatforms = Object.entries(platforms)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(",");

        // Build scheduled_at if scheduled mode
        let scheduledAt: string | null = null;
        if (scheduleMode === "scheduled" && scheduledDate) {
            scheduledAt = `${scheduledDate}T${scheduledTime}:00`;
        }

        const newResults: string[] = [];

        for (const video of videoQueue) {
            const formData = new FormData();
            formData.append("title", video.title || "無題の動画");
            formData.append("description", video.description);
            formData.append("hashtags", video.hashtags);
            formData.append("platforms", selectedPlatforms);
            formData.append("video", video.file);
            if (video.thumbnailFile) {
                formData.append("thumbnail", video.thumbnailFile);
            }
            formData.append("is_kids_content", String(video.isKidsContent));
            formData.append("ig_share_to_feed", String(video.igShareToFeed));
            if (scheduledAt) {
                formData.append("scheduled_at", scheduledAt);
            }

            try {
                const res = await fetch(`${API_BASE}/api/posts`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    console.error("API Error Response:", data);
                    throw new Error(data.detail ? JSON.stringify(data.detail) : "サーバーエラー");
                }

                const status = data.post?.status === "scheduled" ? "📅 予約完了" : "✅ 投稿完了";
                newResults.push(`${status} — ${video.title || "無題"} (ID: ${data.post?.id})`);
            } catch (err: any) {
                console.error("Submit Error:", err);
                newResults.push(`⚠️ ${video.title || "無題"} — 投稿失敗 (${err.message || "接続エラー"})`);
            }
        }

        setResults(newResults);
        setSubmitting(false);
    };

    // Get tomorrow's date as min for scheduler
    const getMinDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    };

    return (
        <>
            <div className="page-header">
                <h2>一括投稿</h2>
                <p>複数の動画をまとめて投稿・予約管理</p>
            </div>

            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <div>
                    <form className="post-form" onSubmit={handleSubmit}>
                        {/* Upload Zone */}
                        <div
                            className={`upload-zone ${videoQueue.length > 0 ? "has-file" : ""}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                            <div className="upload-zone-icon">{videoQueue.length > 0 ? "➕" : "📤"}</div>
                            <div className="upload-zone-text">
                                {videoQueue.length > 0 ? (
                                    <span>クリックで動画を追加（{videoQueue.length}本選択中）</span>
                                ) : (
                                    <>
                                        <strong>クリックまたはドラッグ&ドロップ</strong>で動画をアップロード
                                        <br />
                                        <span style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                                            複数選択可能 · 9:16 推奨
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Video Queue */}
                        {videoQueue.length > 0 && (
                            <div className="video-queue">
                                <div className="video-queue-header">
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>📋 投稿キュー ({videoQueue.length}本)</span>
                                </div>
                                <div className="video-queue-list">
                                    {videoQueue.map((v, i) => (
                                        <div
                                            key={v.id}
                                            className={`video-queue-item ${i === activeIdx ? "active" : ""}`}
                                            onClick={() => setActiveIdx(i)}
                                        >
                                            <div className="video-queue-thumb">
                                                <video src={v.url} muted style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {v.title || `動画 ${i + 1}`}
                                                </div>
                                                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                                                    {v.file.name}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="video-queue-remove"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeVideo(i);
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Video Editor */}
                        {activeVideo && (
                            <div className="section-card" style={{ marginBottom: 0, border: "1px solid var(--color-accent)", borderTop: "3px solid var(--color-accent)" }}>
                                <div style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                                    ✏️ 動画 {activeIdx + 1} / {videoQueue.length} を編集中
                                </div>

                                {/* Thumbnail */}
                                <div className="form-group">
                                    <label>サムネイル設定</label>
                                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                                        <div
                                            style={{ width: 80, height: 110, borderRadius: 8, background: "rgba(0,0,0,0.5)", border: "1px dashed var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
                                            onClick={() => setShowThumbEditor(true)}
                                        >
                                            {activeVideo.thumbnailUrl ? (
                                                <img src={activeVideo.thumbnailUrl} alt="Thumbnail preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <span style={{ fontSize: 24, color: "var(--color-text-muted)" }}>🖼️</span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 200 }}>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className="btn-primary"
                                                    style={{ padding: "8px 16px", fontSize: 12 }}
                                                    onClick={() => setShowThumbEditor(true)}
                                                >
                                                    ✨ 動画からシーンを選ぶ
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    style={{ padding: "8px 16px", fontSize: 12 }}
                                                    onClick={() => thumbInputRef.current?.click()}
                                                >
                                                    画像をアップロード
                                                </button>
                                                {activeVideo.thumbnailUrl && (
                                                    <button
                                                        type="button"
                                                        style={{ padding: "8px 12px", fontSize: 12, background: "transparent", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text-muted)", cursor: "pointer" }}
                                                        onClick={() => {
                                                            updateVideo(activeIdx, "thumbnailFile", undefined);
                                                            updateVideo(activeIdx, "thumbnailUrl", undefined);
                                                        }}
                                                    >
                                                        削除
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                                ※ 「動画からシーンを選ぶ」でシークバーを使ってお好きな場面をサムネイルに設定できます。
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        ref={thumbInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleThumbChange}
                                    />
                                </div>

                                {/* Title */}
                                <div className="form-group">
                                    <label>タイトル</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="例: 朝のルーティン⏰"
                                        value={activeVideo.title}
                                        onChange={(e) => updateVideo(activeIdx, "title", e.target.value)}
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label>説明文</label>
                                    <textarea
                                        className="form-input"
                                        placeholder="動画の説明を入力..."
                                        value={activeVideo.description}
                                        onChange={(e) => updateVideo(activeIdx, "description", e.target.value)}
                                    />
                                </div>

                                {/* Hashtags */}
                                <div className="form-group">
                                    <label>ハッシュタグ</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="#vlog, #日常, #routine"
                                        value={activeVideo.hashtags}
                                        onChange={(e) => updateVideo(activeIdx, "hashtags", e.target.value)}
                                    />
                                </div>

                                {/* Platform Specific Settings */}
                                {platforms.youtube && (
                                    <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                                        <input
                                            type="checkbox"
                                            id="isKidsContent"
                                            checked={activeVideo.isKidsContent}
                                            onChange={(e) => updateVideo(activeIdx, "isKidsContent", e.target.checked)}
                                            style={{ width: 18, height: 18, accentColor: "var(--color-youtube)", cursor: "pointer" }}
                                        />
                                        <label htmlFor="isKidsContent" style={{ margin: 0, cursor: "pointer", fontSize: 13, color: "var(--color-text-muted)" }}>
                                            <span style={{ color: "var(--color-text)" }}>YouTube:</span> 子供向け動画として設定する（COPPA対応）
                                        </label>
                                    </div>
                                )}

                                {platforms.instagram && (
                                    <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                                        <input
                                            type="checkbox"
                                            id="igShareToFeed"
                                            checked={activeVideo.igShareToFeed}
                                            onChange={(e) => updateVideo(activeIdx, "igShareToFeed", e.target.checked)}
                                            style={{ width: 18, height: 18, accentColor: "var(--color-instagram)", cursor: "pointer" }}
                                        />
                                        <label htmlFor="igShareToFeed" style={{ margin: 0, cursor: "pointer", fontSize: 13, color: "var(--color-text-muted)" }}>
                                            <span style={{ color: "var(--color-text)" }}>Instagram:</span> フィードにもシェアする
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Platform & Channel Selection */}
                        <div className="form-group">
                            <label>投稿先プラットフォームとチャンネル</label>
                            <div className="platform-checks" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {(["youtube", "tiktok", "instagram"] as const).map(p => {
                                    const selectedChannel = CHANNELS[p].find(c => c.id === selectedChannels[p]) || CHANNELS[p][0];
                                    const isDropdownOpen = openDropdown === p;

                                    return (
                                        <div key={p} style={{
                                            background: "rgba(255,255,255,0.02)",
                                            padding: 12,
                                            borderRadius: 12,
                                            border: "1px solid var(--color-border)",
                                            position: "relative",
                                            zIndex: isDropdownOpen ? 50 : 1
                                        }}>
                                            <div
                                                className={`platform-check ${platforms[p] ? "checked" : ""}`}
                                                onClick={() => togglePlatform(p)}
                                                style={{ margin: 0, width: "100%", justifyContent: "flex-start", padding: "8px 12px" }}
                                            >
                                                <span style={{ color: `var(--color-${p})` }}>
                                                    {p === "youtube" ? "▶️" : p === "tiktok" ? "♪" : "📷"}
                                                </span>
                                                {p === "youtube" ? "YouTube Shorts" : p === "tiktok" ? "TikTok" : "Instagram Reels"}
                                            </div>

                                            {platforms[p] && (
                                                <div className="channel-selector-container">
                                                    <button
                                                        type="button"
                                                        className="channel-selector-button"
                                                        onClick={() => {
                                                            setOpenDropdown(isDropdownOpen ? null : p);
                                                        }}
                                                    >
                                                        <img src={selectedChannel.avatar} alt="avatar" className="channel-avatar" />
                                                        <div className="channel-info">
                                                            <span className="channel-name">{selectedChannel.name}</span>
                                                            <span className="channel-handle">{selectedChannel.handle}</span>
                                                        </div>
                                                        <span className="channel-dropdown-icon">▼</span>
                                                    </button>

                                                    {isDropdownOpen && (
                                                        <div className="channel-dropdown-menu">
                                                            {CHANNELS[p].map(ch => (
                                                                <div
                                                                    key={ch.id}
                                                                    className={`channel-dropdown-item ${selectedChannels[p] === ch.id ? "selected" : ""}`}
                                                                    onClick={() => {
                                                                        setChannel(p, ch.id);
                                                                    }}
                                                                >
                                                                    <img src={ch.avatar} alt="avatar" className="channel-avatar" />
                                                                    <div className="channel-info">
                                                                        <span className="channel-name">{ch.name}</span>
                                                                        <span className="channel-handle">{ch.handle}</span>
                                                                    </div>
                                                                    {selectedChannels[p] === ch.id && (
                                                                        <span style={{ color: "var(--color-accent)", fontSize: 12 }}>✓</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Schedule Toggle */}
                        <div className="form-group">
                            <label>投稿タイミング</label>
                            <div className="schedule-toggle">
                                <button
                                    type="button"
                                    className={`schedule-option ${scheduleMode === "now" ? "active" : ""}`}
                                    onClick={() => setScheduleMode("now")}
                                >
                                    <span style={{ fontSize: 18 }}>🚀</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>今すぐ投稿</div>
                                        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>即時に全プラットフォームへ</div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`schedule-option ${scheduleMode === "scheduled" ? "active" : ""}`}
                                    onClick={() => setScheduleMode("scheduled")}
                                >
                                    <span style={{ fontSize: 18 }}>🕐</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>予約投稿</div>
                                        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>日時を指定して予約</div>
                                    </div>
                                </button>
                            </div>

                            {/* Custom Date & Time Picker */}
                            {scheduleMode === "scheduled" && (
                                <div style={{ marginTop: 16 }}>
                                    <label style={{ fontSize: 13, color: "var(--color-text-muted)" }}>日付と時間を選択</label>
                                    <DateTimePicker
                                        date={scheduledDate}
                                        time={scheduledTime}
                                        onDateChange={setScheduledDate}
                                        onTimeChange={setScheduledTime}
                                    />
                                    {scheduledDate && (
                                        <div style={{ fontSize: 13, color: "var(--color-accent)", marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 600, background: "rgba(0,242,234,0.1)", padding: "10px 14px", borderRadius: 8 }}>
                                            <span>📅</span>
                                            {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString("ja-JP", {
                                                year: "numeric", month: "long", day: "numeric",
                                                weekday: "short", hour: "2-digit", minute: "2-digit",
                                            })} に予約設定中
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            className="btn-primary"
                            type="submit"
                            disabled={submitting || videoQueue.length === 0}
                            style={{ width: "100%" }}
                        >
                            {submitting
                                ? "投稿中..."
                                : scheduleMode === "scheduled"
                                    ? `📅 ${videoQueue.length}本を予約する`
                                    : `🚀 ${videoQueue.length}本を一括投稿する`}
                        </button>

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="post-results">
                                {results.map((r, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: "10px 14px",
                                            borderRadius: 8,
                                            background: r.startsWith("✅") || r.startsWith("📅")
                                                ? "rgba(34,197,94,0.1)"
                                                : "rgba(245,158,11,0.1)",
                                            border: `1px solid ${r.startsWith("✅") || r.startsWith("📅")
                                                ? "rgba(34,197,94,0.3)"
                                                : "rgba(245,158,11,0.3)"}`,
                                            fontSize: 13,
                                        }}
                                    >
                                        {r}
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Thumbnail Editor Modal */}
            {showThumbEditor && activeVideo && (
                <ThumbnailEditorModal
                    video={activeVideo}
                    onClose={() => setShowThumbEditor(false)}
                    onSelect={(file, url) => {
                        updateVideo(activeIdx, "thumbnailFile", file);
                        updateVideo(activeIdx, "thumbnailUrl", url);
                        setShowThumbEditor(false);
                    }}
                />
            )}
        </>
    );
}
