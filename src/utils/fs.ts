import * as fs from 'fs';
import * as path from 'path';
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
    if (err.code == 'ENOENT') return false;
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
