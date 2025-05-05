# GraphQL Faker Definitions

This code is used to manage the real schema and merge the existing schema with fakers definitions.

Warning: THe following files in this directory also exist in the `graphql-faker-sever` project and need to kept in sync:
- `schemaUtils.ts`
- `fakeDefinitions.ts`

If the code between these two repositories does not stay in sync, bugs could be produced in the schema valdation logic making the app unusable. 

--

TODO: move this code to an NPM package and import it. Definately move the following two files, but potentially move the whole directory:
- `schemaUtils.ts`
- `fakeDefinitions.ts`