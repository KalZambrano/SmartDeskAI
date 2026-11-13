.PHONY: up down clean logs ps frontend-install frontend-dev frontend-check backend-run backend-verify

up:
	docker compose up --build -d

down:
	docker compose down

clean:
	docker compose down -v

logs:
	docker compose logs -f

ps:
	docker compose ps

frontend-install:
	cd apps/frontend && pnpm install

frontend-dev:
	cd apps/frontend && pnpm start

frontend-check:
	cd apps/frontend && pnpm lint && pnpm format:check && pnpm test:ci && pnpm build

backend-run:
	set -a && . ./.env && set +a && cd apps/backend && mvn spring-boot:run

backend-verify:
	cd apps/backend && mvn --batch-mode verify
