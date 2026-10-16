# YouEdit 公式サイト

YouEditのチーム紹介とポートフォリオを統合した静的サイトです。料金表・営業プラン・地域密着の訴求はありません。

## ページ

- HOME: `/`
- WORKS: `/works/`（作品一覧）と `/works/作品slug/`（個別ページ）
- ABOUT: `/about/`
- CONTACT: `/contact/`（Netlify Forms）
- プライバシーポリシー: `/privacy/`

## Netlify の設定

既存のNetlifyサイト `elegant-boba-63a522` にこのGitHubリポジトリ `YouEdit/Website` を接続してください。新しいNetlifyプロジェクトを作る必要はありません。

ビルドコマンド: `npm run build`
公開ディレクトリ: `dist`
Node.js: 22

`netlify.toml` に設定済みです。

## 編集

- `content/works.json`：作品名・YouTube URL・説明・カテゴリー。追加すると一覧と詳細ページが自動生成されます。
- `content/site.json`：公式URL、チーム紹介、メール、Instagramなど。
- `assets/style.css`：デザイン。

YouTube動画URLは実際に公開されている動画を設定してください。foriioを削除する前に全作品の移行と表示確認をしてください。

## コマンド

```sh
npm run build
```

## お問い合わせ

Netlify Formsを使用します。初回デプロイ後にNetlify > Forms でフォーム検出を確認し、メール通知を設定してテスト送信してください。メール `info@you-edit.com` で受信可能かも確認してください。

## Google検索

正式URLは `https://youedit.jp` に設定済みです。独自ドメインのDNSとHTTPSが有効になった後、Google Search Consoleでサイトマップを送信してください。

※ YouEditの既存プロジェクトで設定されているドメインはNetlify側に残ります。GitHubにコードを登録するだけではNetlifyとの連携は完了しません。

## 公開設定変更後のデプロイ

Netlify の無料プランで非公開リポジトリの投稿者制限によるビルド失敗が発生し、リポジトリを Public に変更した場合は、新しいコミットをプッシュしてNetlifyに変更を通知します。Netlify の Deploys 画面で最新ビルド結果を確認してください。
