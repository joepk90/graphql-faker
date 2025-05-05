import { allFakers } from '@faker-js/faker';
import { parse } from 'graphql';

export const fakeDefinitionAST = parse(/* GraphQL */ `
  enum fake__Locale {
    ${Object.keys(allFakers).join(' ')}
  }

  enum fake__Types {
    zipCode
    city
    streetName
    "Configure address with option \`useFullAddress\`"
    streetAddress
    secondaryAddress
    county
    country
    countryCode
    state
    stateAbbr
    latitude
    longitude

    colorName
    productCategory
    productName
    "Sum of money. Configure with options \`minMoney\`/\`maxMoney\` and 'decimalPlaces'."
    money
    productMaterial
    product

    companyName
    companyCatchPhrase
    companyBS

    dbColumn
    dbType
    dbCollation
    dbEngine

    """
    By default returns dates between 2000-01-01 and 2030-01-01.
    Configure date format with options \`dateFormat\` \`dateFrom\` \`dateTo\`.
    """
    date
    "Configure date format with option \`dateFormat\`"
    pastDate
    "Configure date format with option \`dateFormat\`"
    futureDate
    "Configure date format with option \`dateFormat\`"
    recentDate

    financeAccountName
    financeTransactionType
    currencyCode
    currencyName
    currencySymbol
    bitcoinAddress
    internationalBankAccountNumber
    bankIdentifierCode

    hackerAbbreviation
    hackerPhrase

    "An image url. Configure image with options: \`imageCategory\`, \`imageWidth\`, \`imageHeight\` and \`randomizeImageUrl\`"
    imageUrl
    "An URL for an avatar"
    avatarUrl
    "Configure email provider with option: \`emailProvider\`"
    email
    url
    domainName
    ipv4Address
    ipv6Address
    userAgent
    "Configure color with option: \`baseColor\`"
    colorHex
    macAddress
    "Configure password with option \`passwordLength\`"
    password

    "Lorem Ipsum text. Configure size with option \`loremSize\`"
    lorem

    firstName
    lastName
    fullName
    jobTitle

    phoneNumber

    number
    uuid
    word
    words
    locale

    filename
    mimeType
    fileExtension
    semver
  }

  input fake__imageSize {
    width: Int!
    height: Int!
  }

  enum fake__loremSize {
    word
    words
    sentence
    sentences
    paragraph
    paragraphs
  }

  input fake__color {
    red255: Int = 0
    green255: Int = 0
    blue255: Int = 0
  }

  input fake__options {
    "Only for type \`streetAddress\`"
    useFullAddress: Boolean
    "Only for type \`money\`"
    minMoney: Float
    "Only for type \`money\`"
    maxMoney: Float
    "Only for type \`money\`"
    decimalPlaces: Int
    "Only for type \`imageUrl\`"
    imageSize: fake__imageSize
    "Only for type \`imageUrl\`. Example value: \`[\\"nature\\", \\"water\\"]\`."
    imageKeywords: [String!]
    "Only for type \`imageUrl\`"
    randomizeImageUrl: Boolean
    "Only for type \`email\`"
    emailProvider: String
    "Only for type \`password\`"
    passwordLength: Int
    "Only for type \`lorem\`"
    loremSize: fake__loremSize
    "Only for types \`*Date\`. Example value: \`YYYY MM DD\`. [Full Specification](http://momentjs.com/docs/#/displaying/format/)"
    dateFormat: String = "YYYY-MM-DDTHH:mm:ss[Z]"
    "Only for types \`betweenDate\`. Example value: \`1986-11-02\`."
    dateFrom: String = "2010-01-01"
    "Only for types \`betweenDate\`. Example value: \`2038-01-19\`."
    dateTo: String = "2030-01-01"
    "Only for type \`colorHex\`. [Details here](https://stackoverflow.com/a/43235/4989887)"
    baseColor: fake__color = { red255: 0, green255: 0, blue255: 0 }
    "Only for type \`number\`"
    minNumber: Float
    "Only for type \`number\`"
    maxNumber: Float
    "Only for type \`number\`"
    precisionNumber: Float
  }

  directive @fake(
    type: fake__Types!
    options: fake__options = {}
    locale: fake__Locale
  ) on FIELD_DEFINITION | SCALAR

  directive @listLength(min: Int!, max: Int!) on FIELD_DEFINITION

  scalar examples__JSON
  directive @examples(values: [examples__JSON]!) on FIELD_DEFINITION | SCALAR
`);
