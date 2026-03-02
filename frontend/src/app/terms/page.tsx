import React from "react";

export const metadata = {
    title: "利用規約 | BUZZ-ROOT",
    description: "BUZZ-ROOTの利用規約です。",
};

export default function TermsOfServicePage() {
    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
            <h1 style={{ fontSize: 32, marginBottom: 24 }}>利用規約 (Terms of Service)</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>最終更新日: 2026年2月25日</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.6 }}>
                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>1. 適用</h2>
                    <p>本規約は、BUZZ-ROOT（以下、「当サービス」）の提供条件および当サービスの利用に関する事項を定めるものです。ユーザーは、本規約に同意した上で当サービスを利用するものとします。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>2. サービスの提供と変更</h2>
                    <p>当サービスは、対象のSNSプラットフォーム（YouTube Shorts、TikTok、Instagram Reels 等）に対する動画管理・投稿効率化ツールを提供します。当サービスは、事前通知なく機能の変更、追加、または提供の停止を行う場合があります。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>3. 外部SNS連携と自己責任</h2>
                    <p>当サービスの利用には、各プラットフォームへのOAuth連携が必要です。機能の利用において、各プラットフォームの利用規約およびコミュニティガイドラインを遵守する義務はユーザー自身にあります。</p>
                    <p>当サービスを通じて投稿されたコンテンツによって生じたいかなる問題（アカウントの一時停止、削除、ペナルティ等）について、当サービスは一切の責任を負いません。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>4. 禁止事項</h2>
                    <p>ユーザーは、当サービスの利用にあたり以下の行為を行ってはなりません。</p>
                    <ul style={{ marginLeft: 24, marginTop: 8 }}>
                        <li>法令に違反する行為、またはそれに類する行為。</li>
                        <li>スパム目的での短時間での大量の自動投稿行為。</li>
                        <li>当サービスのサーバーやネットワークシステムに過度な負荷をかける行為。</li>
                        <li>第三者の著作権、プライバシーその他の権利を侵害する行為。</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>5. 免責事項</h2>
                    <p>当サービスのご利用によりユーザーに発生した損害について、当サービスは一切の賠償責任を負わないものとします。APIの一時的な不具合や、プラットフォーム側の仕様変更による影響についても同様です。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>6. プライバシー・個人情報</h2>
                    <p>当サービスのプライバシー情報の取り扱いについては、別途定める「プライバシーポリシー」に従うものとします。</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 20, marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>7. 規約の変更</h2>
                    <p>当サービスは、必要と判断した場合には、ユーザーに事前に通知することなく本規約を変更できるものとします。変更後の規約は、当サービス上に掲示された時点で効力を生じるものとします。</p>
                </section>
            </div>
        </div>
    );
}
