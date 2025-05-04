# GraphQL Faker Server
A refactor of the [https://github.com/graphql-kit/graphql-faker](https://ggithub.com/graphql-kit/graphql-faker) project.

The main reason for making this project was to change the functionality of extending types. It is now possible to override existing fields on existing types, and return data you define. For more details of the complete project see:
[github.com/joepk90/graphql-faker-refactored](https://github.com/joepk90/graphql-faker-refactored)

---

This repository just handles the server side logic of the original GraphQL Faker project, allowing users to create a local custom GraphQL schema using `fakerJS` definitions, as well as the ability of overriding any existing remote schema by acting a GraphQL broker, intercepting requests and overriding the response to return fake data to the client.

The Front End (Editor) has been moved to a new repository, which can be found here:
[github.com/joepk90/graphql-faker-editor](https://github.com/joepk90/graphql-faker-editor) 

## Development

To start the project run the following command
```
# clone the repository
git clone git@github.com:joepk90/graphql-faker-server.git

# move into the repository
cd graphql-faker-server

# create an .env file using env.example
# cp .env.example .env

# start the service
make dev
```


# Options

| **Environment Variables**    | **Description**                                                                                         |
|------------------------------|---------------------------------------------------------------------------------------------------------|
| `EXTEND_URL`                 | URL to an existing GraphQL server to extend.                                                            |
| `FORWARD_HEADERS`             | Specify which headers should be forwarded to the proxied server                                        |
| `SCHEMA_FILE_NAME`           | Name of the Schema file you want to edit. [default: `schema_extension`]                                 |
| `CUSTOM_HEADERS`              | Option to add custom headers to GraphQL requests (Currently required in order to use Voyager) [default: `FALSE`].                             |
| `ALLOWED_HOSTS`              | Hosts allowed to access the server. Set this value to `*` to disable cors. [default: `http://localhost:5173,`  ].     |
| `SERVER_PORT`                       | HTTP Port [default: `3000`].                                                              |
