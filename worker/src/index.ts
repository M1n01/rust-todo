// worker/src/index.ts
interface Env {
  // 必要な環境変数があれば定義
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORSヘッダーの設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
      'Access-Control-Max-Age': '86400',
    };

    // OPTIONSリクエストの処理（プリフライトリクエスト）
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // URLパスの取得
    const url = new URL(request.url);

    // /hello エンドポイントの処理
    if (url.pathname === '/hello') {
      return new Response(JSON.stringify({ message: 'Hello from Cloudflare Workers!' }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // 404エラーの処理
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
} satisfies ExportedHandler<Env>;
