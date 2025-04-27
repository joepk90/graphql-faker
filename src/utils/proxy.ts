import {
  execute,
  ExecutionArgs,
  GraphQLError,
  GraphQLSchema,
  isAbstractType,
  Kind,
  print,
  separateOperations,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  ASTNode,
  SelectionSetNode,
} from 'graphql';
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { Headers } from 'node-fetch';
import {
  graphqlRequest,
  getHeadersToForward,
  getSchemaExtendURL,
  getCustomHeaders,
  mergeObjectsIgnoreCase,
  copyHeadersFromRequest,
  GraphQLRequestVariables,
  GraphQLResponse,
} from 'src/utils';

/**
 * getHeaders will get both
 * - the headers from the request, using specified headers in the FORWARD_HEADERS env var
 * - get headers specified in the .headers.json file
 *
 * it then merges both sets of headers, prioritising the headers from the .headers.json file
 * @param requestHeaders
 * @returns
 */

const getHeaders = (requestHeaders: IncomingHttpHeaders) => {
  const forwardHeaders = getHeadersToForward();

  const customHeaders = getCustomHeaders();

  const headersToForward = copyHeadersFromRequest(
    requestHeaders,
    forwardHeaders,
  );

  return mergeObjectsIgnoreCase(
    headersToForward,
    customHeaders as Headers,
  ) as Headers;
};

export const getProxyExecuteFn = async () => {
  const extendURL = getSchemaExtendURL();

  // return undefined if no url is passed
  if (!extendURL) return;

  return async (args: ExecutionArgs) => {
    const { schema, document, contextValue, operationName } = args;

    const request = contextValue as IncomingMessage;

    let headers: Headers = new Headers();
    if (request?.headers) {
      headers = getHeaders(request.headers) as Headers;
    }

    // test validation
    // try {
    //   removeUnusedVariables(stripExtensionFields(schema, document));
    // } catch (error) {
    //   console.log('error: ', error);
    // }
    const strippedAST = removeUnusedVariables(
      stripExtensionFields(schema, document),
    );

    const operations = separateOperations(strippedAST);
    const operationAST = operationName
      ? operations[operationName]
      : Object.values(operations)[0];

    const response = await graphqlRequest(
      extendURL,
      print(operationAST),
      headers,
      args.variableValues as ExecutionArgs,
      operationName,
    );
    return await proxyResponse(response, args);
  };
};

function proxyResponse(response: GraphQLResponse, args: ExecutionArgs) {
  const rootValue = response.data || {};
  const globalErrors: GraphQLError[] = [];

  for (const error of response.errors || []) {
    const { message, path, extensions } = error;
    const errorObj = new GraphQLError(
      message,
      undefined,
      undefined,
      undefined,
      path,
      undefined,
      extensions,
    );

    if (!path) {
      globalErrors.push(errorObj);
      continue;
    }

    // Recreate root value up to a place where original error was thrown
    // and place error as field value.
    pathSet(rootValue, error.path, errorObj);
  }

  if (globalErrors.length !== 0) {
    return { errors: globalErrors };
  }

  return execute({ ...args, rootValue });
}

function pathSet(rootObject, path, value) {
  let currentObject = rootObject;

  const basePath = [...path];
  const lastKey = basePath.pop();
  for (const key of basePath) {
    if (currentObject[key] == null) {
      currentObject[key] = typeof key === 'number' ? [] : {};
    }
    currentObject = currentObject[key];
  }

  currentObject[lastKey] = value;
}

function injectTypename(node: SelectionSetNode) {
  return {
    ...node,
    selections: [
      ...node.selections,
      {
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: '__typename',
        },
      },
    ],
  };
}

function stripExtensionFields(schema: GraphQLSchema, operationAST: ASTNode) {
  const typeInfo = new TypeInfo(schema);

  return visit(
    operationAST,
    visitWithTypeInfo(typeInfo, {
      [Kind.FIELD]: () => {
        const fieldDef = typeInfo.getFieldDef();
        if (
          fieldDef.name.startsWith('__') ||
          fieldDef.extensions['isExtensionField'] === true
        ) {
          return null;
        }
      },
      [Kind.SELECTION_SET]: {
        leave(node) {
          const type = typeInfo.getParentType();
          if (isAbstractType(type) || node.selections.length === 0)
            return injectTypename(node);
        },
      },
    }),
  );
}

function removeUnusedVariables(documentAST: ASTNode) {
  const seenVariables = Object.create(null);

  visit(documentAST, {
    [Kind.VARIABLE_DEFINITION]: () => false,
    [Kind.VARIABLE]: (node) => {
      seenVariables[node.name.value] = true;
    },
  });

  return visit(documentAST, {
    [Kind.VARIABLE_DEFINITION]: (node) => {
      if (!seenVariables[node.variable.name.value]) {
        return null;
      }
    },
  });
}
