import { NextResponse } from "next/server";

// 各SNSからのOAuthコールバックリクエストを受け取るダミーのAPIエンドポイント
// 実際の連携処理はバックエンド（Python）で行いますが、
// TikTokなどの審査・設定画面のバリデーションを通過するためにフロントエンド側にも設置します。

export async function GET(
    request: Request,
    context: { params: Promise<{ platform: string }> }
) {
    const { platform } = await context.params;

    // URLの認証チェックを通すために、200 OK のレスポンスを返す
    return NextResponse.json({
        success: true,
        message: `${platform || "unknown"} API Endpoint Validation OK`,
        timestamp: new Date().toISOString(),
    });
}
