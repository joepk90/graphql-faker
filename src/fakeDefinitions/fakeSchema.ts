import assert from 'assert';
import {
  defaultFieldResolver,
  defaultTypeResolver,
  getDirectiveValues,
  getNullableType,
  GraphQLFieldResolver,
  GraphQLLeafType,
  GraphQLTypeResolver,
  isAbstractType,
  isCompositeType,
  isEnumType,
  isLeafType,
  isListType,
  isNonNullType,
  GraphQLField,
  GraphQLDirective,
  GraphQLNamedType,
} from 'graphql';

import {
  fakeValue,
  getRandomInt,
  getRandomItem,
  stdScalarFakers,
  StdScalarFakersInterface,
} from 'src/fakeDefinitions';

import { FakeArgs, ExamplesArgs, ListLengthArgs } from 'src/fakeDefinitions';

export const fakeTypeResolver: GraphQLTypeResolver<unknown, unknown> = async (
  value,
  context,
  info,
  abstractType,
) => {
  const defaultResolved = await defaultTypeResolver(
    value,
    context,
    info,
    abstractType,
  );
  if (defaultResolved != null) {
    return defaultResolved;
  }

  const possibleTypes = info.schema.getPossibleTypes(abstractType);
  return getRandomItem(possibleTypes);
};

export const fakeFieldResolver: GraphQLFieldResolver<unknown, unknown> = async (
  source,
  args,
  context,
  info,
) => {
  const { schema, parentType, fieldName } = info;
  const fieldDef = parentType.getFields()[fieldName];

  let resolved = await defaultFieldResolver(source, args, context, info);

  if (resolved === undefined && source && typeof source === 'object') {
    resolved = (source as Record<string | number, unknown>)[info.path.key];
  }

  if (resolved === undefined) {
    resolved = fakeValueOfType(fieldDef.type as GraphQLLeafType);
  }

  if (resolved instanceof Error) {
    return resolved;
  }

  const isMutation = parentType === schema.getMutationType();
  const isCompositeReturn = isCompositeType(getNullableType(fieldDef.type));
  if (isMutation && isCompositeReturn && isPlainObject(resolved)) {
    const inputArg = args['input'];
    return {
      ...(Object.keys(args).length === 1 && isPlainObject(inputArg)
        ? inputArg
        : args),
      ...resolved,
    };
  }

  return resolved;

  // fakeValueOfType(type: GraphQLLeafType | GraphQLTypeResolver<unknown, unknown>): unknown

  function fakeValueOfType(type: GraphQLLeafType): unknown {
    if (isNonNullType(type)) {
      return fakeValueOfType(type.ofType);
    }

    if (isListType(type)) {
      return Array(getListLength(fieldDef))
        .fill(null)
        .map(() => fakeValueOfType(type.ofType));
    }

    const valueCB =
      getExampleValueCB(fieldDef) ||
      getFakeValueCB(fieldDef) ||
      getExampleValueCB(type) ||
      getFakeValueCB(type);

    if (isLeafType(type)) {
      if (valueCB) {
        return valueCB();
      }
      return fakeLeafValueCB(type);
    } else {
      // TODO: error on fake directive
      const __typename: string = isAbstractType(type)
        ? getRandomItem(schema.getPossibleTypes(type)).name
        : (type as GraphQLLeafType).name;

      return {
        __typename,
        ...(valueCB ? valueCB() : {}),
      };
    }
  }

  function getFakeValueCB(
    object:
      | GraphQLLeafType
      | GraphQLField<
          any,
          any,
          {
            [key: string]: any;
          }
        >,
  ) {
    const fakeDirective = schema.getDirective('fake');
    const args = getDirectiveArgs(fakeDirective, object) as FakeArgs;
    return args && (() => fakeValue(args.type, args.options, args.locale));
  }

  function getExampleValueCB(
    object:
      | GraphQLLeafType
      | GraphQLField<
          any,
          any,
          {
            [key: string]: any;
          }
        >,
  ) {
    const examplesDirective = schema.getDirective('examples');
    const args = getDirectiveArgs(examplesDirective, object) as ExamplesArgs;
    return args && (() => getRandomItem(args.values));
  }

  function getListLength(
    object:
      | GraphQLLeafType
      | GraphQLField<
          any,
          any,
          {
            [key: string]: any;
          }
        >,
  ) {
    const listLength = schema.getDirective('listLength');
    const args = getDirectiveArgs(listLength, object) as ListLengthArgs;
    return args ? getRandomInt(args.min, args.max) : getRandomInt(2, 4);
  }
};

const getFakerByType = (
  stdScalarFakers: StdScalarFakersInterface,
  type: GraphQLLeafType,
) => {
  return (
    Object.keys(stdScalarFakers) as (keyof typeof stdScalarFakers)[]
  ).includes(type.name as keyof typeof stdScalarFakers)
    ? stdScalarFakers[type.name as keyof typeof stdScalarFakers]
    : undefined;
};

function fakeLeafValueCB(type: GraphQLLeafType) {
  if (isEnumType(type)) {
    const values = type.getValues().map((x) => x.value);
    return getRandomItem(values);
  }

  const faker = getFakerByType(stdScalarFakers, type);
  if (faker) return faker();

  return `<${type.name}>`;
}

interface DirectiveArgs {
  [key: string]: any;
}

function getDirectiveArgs(
  directive: GraphQLDirective | null | undefined,
  object: GraphQLField<any, any> | GraphQLNamedType,
): DirectiveArgs | undefined {
  assert(directive != null);

  let args: DirectiveArgs | undefined = undefined;

  if (object.astNode != null) {
    args = getDirectiveValues(directive, object.astNode) as DirectiveArgs;
  }

  // @ts-ignore
  if (object.extensionNodes != null) {
    // @ts-ignore
    for (const node of object.extensionNodes) {
      args = getDirectiveValues(directive, node);
    }
  }

  return args;
}

function isPlainObject(
  maybeObject: unknown,
): maybeObject is Record<string, unknown> {
  return (
    typeof maybeObject === 'object' &&
    maybeObject !== null &&
    !Array.isArray(maybeObject)
  );
}
