CONTAINER_NAME := template
APP_IMAGE := app

COMPOSE_FILE := compose.yml
COMPOSE = docker compose

# デフォルトのターゲット
all: up

# Docker コンテナとイメージの起動
up:
	$(COMPOSE) up -d

# Docker コンテナの停止
down:
	$(COMPOSE) down

# コンテナのログを表示
logs:
	$(COMPOSE) logs -f

# 特定のサービスのシェルに接続
app-shell:
	$(COMPOSE) exec $(APP_IMAGE) sh

# コンテナの再起動
restart:
	$(COMPOSE) restart

# コンテナとネットワークの削除
clean:
	$(COMPOSE) down --remove-orphans

# コンテナ、ネットワーク、イメージ、ボリュームの完全削除
fclean: clean
	$(COMPOSE) down -v --rmi all
	docker system prune -af

# 完全削除後に再構築
re: fclean all

# コンテナのステータス確認
ps:
	$(COMPOSE) ps

# イメージのビルド
build:
	$(COMPOSE) build --no-cache

local:
	cd app/wasm && wasm-pack build --target web && cd - && pnpm dev

# ヘルプメッセージ
help:
	@echo "使用可能なコマンド:"
	@echo "  make          - コンテナを起動"
	@echo "  make up       - コンテナを起動"
	@echo "  make down     - コンテナを停止"
	@echo "  make logs     - コンテナのログを表示"
	@echo "  make restart  - コンテナを再起動"
	@echo "  make clean    - コンテナとネットワークを削除"
	@echo "  make fclean   - すべてのDocker関連リソースを削除"
	@echo "  make re       - すべて再構築"
	@echo "  make ps       - コンテナの状態を表示"
	@echo "  make build    - イメージを再ビルド"

.PHONY: all up down logs frontend-shell backend-shell restart clean fclean re ps build help
