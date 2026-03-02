import React from "react";

export const metadata = {
    title: "プライバシーポリシー | BUZZ-ROOT",
    description: "BUZZ-ROOTのプライバシーポリシーです。",
};

export default function PrivacyPolicyPage() {
    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
            <h1 style={{ fontSize: 32, marginBottom: 24 }}>プライバシーポリシー (Privacy Policy)</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>最終更新日: 2026年2月25日</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.6 }}>
                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>1. はじめに</h2>
                    <p>BUZZ-ROOT（以下、「当サービス」）は、ユーザーの皆様から取得する個人情報を保護し、適切に取り扱うことを重要な責務と考えています。本プライバシーポリシーでは、当サービスが提供するアプリケーションにおける個人情報の収集、利用、管理方法について説明します。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>2. 取得する情報</h2>
                    <p>当サービスは、以下の情報を取得する場合があります。</p>
                    <ul style={{ marginLeft: 24, marginTop: 8 }}>
                        <li><strong>アカウント情報:</strong> SNSアカウント（YouTube、TikTok、Instagram等）との連携に必要なアクセストークン、ユーザーID、プロフィール情報（アイコン画像、表示名等）。</li>
                        <li><strong>運用データ:</strong> 当サービスを通じて投稿された動画ファイルのメタデータ、およびアクセス解析から得られる統計情報（再生数、いいね数等）。</li>
                        <li><strong>利用状況:</strong> サービスの利用履歴や、エラーログなどの通信情報。</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>3. 情報の利用目的</h2>
                    <p>取得した情報は、以下の目的のためにのみ利用します。</p>
                    <ul style={{ marginLeft: 24, marginTop: 8 }}>
                        <li>各SNSプラットフォームへの効率的な動画投稿機能（予約・即時）の提供。</li>
                        <li>アナリティクス機能（パフォーマンス分析、離脱率等の表示）の提供。</li>
                        <li>サービスの品質向上、バグ修正、およびユーザーサポートのため。</li>
                    </ul>
                    <p style={{ marginTop: 8 }}>当サービスは、取得した情報を外部の第三者に販売したり、スパム等の不正な目的に利用することはありません。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>4. Google API / 第三者APIの利用について</h2>
                    <p>当サービスは、YouTube Data API v3 等の第三者APIを利用しています。</p>
                    <ul style={{ marginLeft: 24, marginTop: 8 }}>
                        <li>APIを通じて取得したデータは、当サービス内でのユーザーの利便性向上のためにのみ利用され、用途外の使用は行いません。</li>
                        <li>ユーザーは、各プラットフォームの設定画面等からいつでも当サービスへのアクセス権限を取り消すことができます。（例: <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent)" }}>Google アカウントのセキュリティ設定</a>）</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>5. データの保護と管理</h2>
                    <p>当サービスは、ユーザーのトークン情報や秘密情報を安全に保存するため、暗号化通信等の合理的なセキュリティ対策を講じます。ユーザー自身がアカウント連携を解除した場合、関連するトークン情報は速やかに無効化されます。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>6. 免責事項</h2>
                    <p>当サービスの利用において生じた如何なる損害についても、当サービスは一切の責任を負いません。外部プラットフォームの規約変更やAPIの仕様変更により、予告なく本サービスの機能が制限される場合があります。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>7. お問い合わせ</h2>
                    <p>本プライバシーポリシーに関するお問い合わせは、当サービスの管理者（または対応する連絡先）までお願いいたします。</p>
                </section>
            </div>
        </div>
    );
}
