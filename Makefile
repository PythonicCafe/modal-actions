all: watch

clean:
	rm -rf dist/

watch:
	docker compose up

bundle:
	docker compose -f docker-compose.yml -f docker/build.yml up
	yarn pack

test:
	docker compose -f docker-compose.yml -f docker/test.yml up

test-watch:
	docker compose -f docker-compose.yml -f docker/test-watch.yml up

release: clean bundle
	yarn publish
