# template

## 目次

- [template](#template)
	- [目次](#目次)
	- [使用技術について](#使用技術について)
		- [フロントエンド](#フロントエンド)
		- [バックエンド](#バックエンド)
		- [ミドルウェア](#ミドルウェア)
	- [環境構築](#環境構築)
		- [クローン](#クローン)
		- [各環境の立ち上げ](#各環境の立ち上げ)
		- [アクセス方法](#アクセス方法)
	- [ディレクトリ構造](#ディレクトリ構造)
	- [Gitの運用](#gitの運用)
		- [ブランチについて](#ブランチについて)
		- [コミットメッセージの記法](#コミットメッセージの記法)

## 使用技術について

### フロントエンド
- Vite
- React
- TypeScript
- Mantine

### バックエンド
- Rust

### ミドルウェア
- Docker
- PostgreSQL

<p align="right">(<a href="#top">トップへ</a>)</p>

## 環境構築

### クローン

```
$ git clone <repository>

// パッケージインストール
$ pnpm install

// Rustのビルド
$ cd backend && cargo build
```

### 各環境の立ち上げ

```
// DBの立ち上げ
$ make up

// バックエンドの立ち上げ
$ cd backend && cargo watch -x run

// フロントエンドの立ち上げ(別ターミナルを開く)
// プロジェクトルートで行う
$ pnpm dev
```

### アクセス方法

- フロントエンド
  http://localhost:5173/

- バックエンド
  http://localhost:3000/

<p align="right">(<a href="#top">トップへ</a>)</p>

## ディレクトリ構造

```
$ tree . -L 3 -I "node_modules|frontend/node_modules"
.
├── Makefile
├── README.md
├── backend
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── migrations
│   │   ├── 20241029134221_init.sql
│   │   └── 20241105110528_label.sql
│   ├── src
│   │   ├── handlers
│   │   ├── handlers.rs
│   │   ├── main.rs
│   │   ├── repositories
│   │   └── repositories.rs
│   └── target
│       ├── CACHEDIR.TAG
│       └── debug
├── compose.yml
├── db
│   └── Dockerfile
├── eslint.config.mjs
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── postcss.config.cjs
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   ├── components
│   │   ├── index.css
│   │   ├── lib
│   │   ├── main.tsx
│   │   ├── pages
│   │   ├── types
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── package.json
└── pnpm-lock.yaml

17 directories, 30 files
```

<p align="right">(<a href="#top">トップへ</a>)</p>

## Gitの運用

### ブランチについて

Github-flowを使用する。
mainとfeatureブランチで運用する。

| ブランチ名 |   役割   | 派生元 | マージ先 |
| :--------: | :------: | :----: | :------: |
|    main    | 本番環境 |   -    |    -     |
| feature/\* | 機能開発 |  main  |   main   |

### コミットメッセージの記法

```
fix: バグ修正
feat: 新機能追加
update: 機能更新
change: 仕様変更
perf: パフォーマンス改善
refactor: コードのリファクタリング
docs: ドキュメントのみの変更
style: コードのフォーマットに関する変更
test: テストコードの変更
revert: 変更の取り消し
chore: その他の変更
```

<p align="right">(<a href="#top">トップへ</a>)</p>
