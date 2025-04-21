DOCKER_REGISTRY=jparkkennaby
IMAGE_NAME=graphql-faker
DOCKER_IMAGE=$(DOCKER_REGISTRY)/$(IMAGE_NAME)

dev:
	npm start

docker-build:
	docker build -t ${DOCKER_IMAGE} .

docker-run:
	docker run -it \
	-p 9092:9092 \
	-e ALLOWED_HOSTS=http://localhost:8080 \
	-e PORT=9092 \
	-e EXTEND_URL=https://swapi-graphql.netlify.app/graphql \
	${DOCKER_IMAGE}

docker-debug:
	docker run -it \
	-p 9092:9092 \
	-e ALLOWED_HOSTS=http://localhost:8080 \
	-e PORT=9092 \
	-e EXTEND_URL=https://swapi-graphql.netlify.app/graphql \
	${DOCKER_IMAGE} /bin/bash

docker-tag:
	docker tag ${DOCKER_IMAGE} ${DOCKER_IMAGE}:latest

docker-push:
	docker push ${DOCKER_IMAGE}:latest
