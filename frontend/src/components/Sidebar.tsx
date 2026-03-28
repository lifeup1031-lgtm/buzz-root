"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/api";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ display_name?: string; email?: string } | null>(null);

    useEffect(() => {
        // Hydration safely load user from localStorage
        const storedUser = localStorage.getItem("buzz_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, [pathname]); // Re-check on nav in case they just logged in

    const handleLogout = () => {
        localStorage.removeItem("buzz_auth_token");
        localStorage.removeItem("buzz_user");
        setUser(null);
        showToast("ログアウトしました", "info");
        router.push("/login");
    };

    const links = [
        {
            href: "/",
            label: "ダッシュボード",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            ),
        },
        {
            href: "/post",
            label: "一括投稿",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
            ),
        },
        {
            href: "/manage",
            label: "投稿管理",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
        },
        {
            href: "/analytics",
            label: "分析",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
            ),
        },
        {
            href: "/settings",
            label: "設定・連携",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            ),
        }
    ];

    return (
        <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
            <div className="sidebar-logo">
                <div>
                    <h1>BUZZ-ROOT</h1>
                    <span>バズルート</span>
                </div>
            </div>
            
            <nav className="sidebar-nav" style={{ flex: 1 }}>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                    >
                        {link.icon}
                        {link.label}
                    </Link>
                ))}
            </nav>

            {user && (
                <div style={{
                    padding: "16px",
                    borderTop: "1px solid var(--border)",
                    marginTop: "auto",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "14px"
                        }}>
                            {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                {user.display_name || "ユーザー"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: "8px",
                            backgroundColor: "transparent",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--color-text)",
                            cursor: "pointer",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "background 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        ログアウト
                    </button>
                </div>
            )}
        </aside>
    );
}
