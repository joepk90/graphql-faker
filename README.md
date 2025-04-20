# GraphQL Faker Refactor
A refactor of the [https://github.com/graphql-kit/graphql-faker](github.com/graphql-kit/graphql-faker) project. Libraries have been updated, and the code restructured - It's an improvement (IMO), but there is more that can be done.

The Front End (Editor) has been moved to a new repository, this now just handled the backend service that requests data from graphql and saves a customer SDL file.

The Front End Project can be found here:
[https://github.com/joepk90/graphql-editor](github.com/joepk90/graphql-editor) 


## TODO
- Potentially move the AUTH_TOKEN logic out of this repository - auth tokens should be coming from the front end.
    - It seems AUTH_TOKEN is currently required to handle authentication for Voyager -need to work out how to add it from the front end.