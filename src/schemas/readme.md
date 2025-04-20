# GraphQL Schema Files
These files serve as iniital schemas. They are used as defaults for when the application first starts.

- If not remoteSDL is used, meaning the service is not meant to extend another graphql, the default-schema.graphql file is used.
- If a remoteSDL is used, meaning the service extending another graphql, the default-extend.graphql file is used.

However when an update is made in the editor, a new file is saved which is then used instead. of either of these files.
