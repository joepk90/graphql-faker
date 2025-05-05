export interface FakeOptions {
  [key: string]: any;
}

export interface FakeArgs {
  type: string;
  options: FakeOptions;
  locale: string;
}
export interface ExamplesArgs {
  values: [any];
}
export interface ListLengthArgs {
  min: number;
  max: number;
}
export interface DirectiveArgs {
  fake?: FakeArgs;
  examples?: ExamplesArgs;
  listLength?: ListLengthArgs;
}

export interface StdScalarFakersInterface {
  Int: () => number;
  Float: () => number;
  String: () => string;
  Boolean: () => boolean;
  ID: () => string;
}

import { Faker } from '@faker-js/faker';

export interface ExtendedFaker {
  zipCode: () => string;
  city: () => string;
  streetName: () => string;
  streetAddress: {
    args: ['useFullAddress'];
    func: (useFullAddress: boolean) => string;
  };
  secondaryAddress: () => string;
  county: () => string;
  country: () => string;
  countryCode: () => string;
  state: () => string;
  stateAbbr: () => string;
  latitude: () => number;
  longitude: () => number;

  colorName: () => string;
  productCategory: () => string;
  productName: () => string;
  money: {
    args: ['minMoney', 'maxMoney', 'decimalPlaces'];
    func: (min: number, max: number, dec: number) => string;
  };
  productMaterial: () => string;
  product: () => string;

  companyName: () => string;
  companyCatchPhrase: () => string;
  companyBs: () => string;

  dbColumn: () => string;
  dbType: () => string;
  dbCollation: () => string;
  dbEngine: () => string;

  date: {
    args: ['dateFormat', 'dateFrom', 'dateTo'];
    func: (
      dateFormat: string,
      dateFrom: string | Date | number,
      dateTo: string | Date | number,
    ) => string;
  };
  pastDate: {
    args: ['dateFormat'];
    func: (dateFormat: string) => string;
  };
  futureDate: {
    args: ['dateFormat'];
    func: (dateFormat: string) => string;
  };
  recentDate: {
    args: ['dateFormat'];
    func: (dateFormat: string) => string;
  };

  financeAccountName: () => string;
  financeTransactionType: () => string;
  currencyCode: () => string;
  currencyName: () => string;
  currencySymbol: () => string;
  bitcoinAddress: () => string;
  internationalBankAccountNumber: () => string;
  bankIdentifierCode: () => string;

  hackerAbbreviation: () => string;
  hackerPhrase: () => string;

  imageUrl: {
    args: ['imageSize', 'imageKeywords', 'randomizeImageUrl'];
    func: (
      size: { width: number; height: number } | null,
      keywords: string[] | null,
      randomize: boolean | null,
    ) => string;
  };

  avatarUrl: () => string;
  email: {
    args: ['emailProvider'];
    func: (provider: string) => string;
  };
  url: () => string;
  domainName: () => string;
  ipv4Address: () => string;
  ipv6Address: () => string;
  userAgent: () => string;
  colorHex: {
    args: ['baseColor'];
    func: (options: {
      redBase: number;
      greenBase: number;
      blueBase: number;
    }) => string;
  };
  macAddress: () => string;
  password: {
    args: ['passwordLength'];
    func: (len: number) => string;
  };

  lorem: {
    args: ['loremSize'];
    func: (size: keyof Faker['lorem']) => string;
  };

  firstName: () => string;
  lastName: () => string;
  fullName: () => string;
  jobTitle: () => string;

  phoneNumber: () => string;

  number: {
    args: ['minNumber', 'maxNumber', 'precisionNumber'];
    func: (min: number, max: number, precision: number) => number;
  };
  uuid: () => string;
  word: () => string;
  words: () => string;
  locale: () => string;

  filename: () => string;
  mimeType: () => string;
  fileExtension: () => string;
  semver: () => string;
}
