all: watch

clean: 
	rm -rf dist/

watch:
	docker compose up

bundle:
	docker compose -f docker-compose.yml -f build.yml up

release: clean bundle
	yarn publish
