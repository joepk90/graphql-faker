import fs from 'fs';
import path from 'path';
import { mkdirSync } from 'fs';

// TODO could replace with: pkg-dir, app-root-path, find-package-json?
export const projectRoot = path.resolve(__dirname, '../../');

export const resolveFromRoot = (...segments: string[]) => {
  return path.join(projectRoot, ...segments);
};

export function existsSync(filePath: string): boolean {
  try {
    fs.statSync(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false;
  }
  return true;
}

export const createDirIfNonExistent = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
};

export const getFile = (filepath: string) => {
  return fs.readFileSync(filepath, 'utf-8');
};

export const getAndParseJsonFile = (filePath: string): any => {
  try {
    const fileContent = getFile(filePath);
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
    return null;
  }
};

export const parseJsonContent = (fileContent: string): any => {
  try {
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error parsing JSON: `, error);
    return null;
  }
};

export const isJsonFileValid = (fileContent: string): any => {
  let isValid = false;

  try {
    JSON.parse(fileContent);
    isValid = true;
  } catch (error) {
    // console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
    isValid = false;
  }

  return isValid;
};

export const getJsonFileIfExists = (path: string) => {
  const fileExist = existsSync(path);

  if (!fileExist) {
    console.log('No JSON file exists at:', path);
    return null;
  }

  const fileContent = getFile(path);

  const isJsonValid = isJsonFileValid(fileContent);

  if (!isJsonValid) {
    console.log('JSON content is invalid: ', path);
    return null;
  }

  return parseJsonContent(fileContent);
};
