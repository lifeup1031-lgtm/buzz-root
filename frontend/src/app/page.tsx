"use client";
import { useEffect, useState } from "react";
import PlatformCard from "@/components/PlatformCard";
import VideoList from "@/components/VideoList";
import ComparisonChart from "@/components/ComparisonChart";

const API_BASE = "http://localhost:8000";

type DashboardData = {
  platforms: Record<string, { views: number; likes: number; saves: number }>;
  highlights: Record<string, string>;
  total_posts: number;
};

type PostData = {
  id: number;
  title: string;
  hashtags: string;
  created_at: string;
  stats: { platform: string; views: number; likes: number; saves: number; views_1h: number }[];
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [comparison, setComparison] = useState<PostData["stats"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/analytics/dashboard`).then((r) => r.json()),
      fetch(`${API_BASE}/api/posts`).then((r) => r.json()),
    ])
      .then(([dashData, postsData]) => {
        setDashboard(dashData);
        setPosts(postsData.posts || []);
        setLoading(false);
      })
      .catch(() => {
        // Use mock data when backend is not running
        setDashboard({
          platforms: {
            youtube: { views: 125400, likes: 8920, saves: 3150 },
            tiktok: { views: 234100, likes: 15600, saves: 5430 },
            instagram: { views: 89200, likes: 12100, saves: 4820 },
          },
          highlights: { views: "tiktok", likes: "tiktok", saves: "tiktok" },
          total_posts: 5,
        });
        setPosts([
          {
            id: 1, title: "朝のルーティン⏰", hashtags: "#morningroutine,#日常,#vlog",
            created_at: new Date().toISOString(),
            stats: [
              { platform: "youtube", views: 12500, likes: 890, saves: 320, views_1h: 4200 },
              { platform: "tiktok", views: 45200, likes: 3400, saves: 1200, views_1h: 18000 },
              { platform: "instagram", views: 8900, likes: 1200, saves: 580, views_1h: 3100 },
            ],
          },
          {
            id: 2, title: "カフェ巡り☕ in 渋谷", hashtags: "#cafe,#渋谷,#カフェ巡り",
            created_at: new Date().toISOString(),
            stats: [
              { platform: "youtube", views: 28300, likes: 2100, saves: 780, views_1h: 8500 },
              { platform: "tiktok", views: 56700, likes: 4200, saves: 1500, views_1h: 22000 },
              { platform: "instagram", views: 19800, likes: 3100, saves: 1100, views_1h: 7200 },
            ],
          },
          {
            id: 3, title: "簡単レシピ🍳 5分パスタ", hashtags: "#cooking,#レシピ,#簡単料理",
            created_at: new Date().toISOString(),
            stats: [
              { platform: "youtube", views: 35100, likes: 2800, saves: 950, views_1h: 12000 },
              { platform: "tiktok", views: 67800, likes: 5100, saves: 1800, views_1h: 28000 },
              { platform: "instagram", views: 24500, likes: 3800, saves: 1400, views_1h: 8800 },
            ],
          },
          {
            id: 4, title: "筋トレ💪 腹筋3分", hashtags: "#fitness,#筋トレ,#workout",
            created_at: new Date().toISOString(),
            stats: [
              { platform: "youtube", views: 42000, likes: 3200, saves: 1100, views_1h: 15000 },
              { platform: "tiktok", views: 38900, likes: 2900, saves: 930, views_1h: 14000 },
              { platform: "instagram", views: 31200, likes: 4500, saves: 1700, views_1h: 11000 },
            ],
          },
          {
            id: 5, title: "夜景ドライブ🌃", hashtags: "#nightdrive,#夜景,#東京",
            created_at: new Date().toISOString(),
            stats: [
              { platform: "youtube", views: 7500, likes: 930, saves: 400, views_1h: 2800 },
              { platform: "tiktok", views: 25500, likes: 2000, saves: 800, views_1h: 9500 },
              { platform: "instagram", views: 4800, likes: 500, saves: 240, views_1h: 1800 },
            ],
          },
        ]);
        setLoading(false);
      });
  }, []);

  const handleSelectPost = (id: number) => {
    setSelectedPostId(id);
    // Try to fetch from API, fallback to local data
    fetch(`${API_BASE}/api/posts/${id}/stats`)
      .then((r) => r.json())
      .then((data) => setComparison(data.stats))
      .catch(() => {
        const post = posts.find((p) => p.id === id);
        if (post) setComparison(post.stats);
      });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: "pulse 2s infinite" }}>📊</div>
          <p style={{ color: "var(--color-text-muted)" }}>データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>ダッシュボード</h2>
        <p>全プラットフォームのパフォーマンスを一目で確認</p>
      </div>

      {dashboard && (
        <div className="kpi-grid">
          {(["youtube", "tiktok", "instagram"] as const).map((platform) => (
            <PlatformCard
              key={platform}
              platform={platform}
              views={dashboard.platforms[platform].views}
              likes={dashboard.platforms[platform].likes}
              saves={dashboard.platforms[platform].saves}
              highlights={dashboard.highlights}
            />
          ))}
        </div>
      )}

      <div className="section-card">
        <h3>🎬 投稿済み動画</h3>
        <VideoList
          videos={posts}
          onSelect={handleSelectPost}
          selectedId={selectedPostId}
        />
      </div>

      <ComparisonChart stats={comparison || []} />
    </>
  );
}
