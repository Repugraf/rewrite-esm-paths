import { lstatSync, readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

/** Returns array of all files and nested files in provided directory */
export const getRecursiveFilePaths = (absoluteDirPath: string) => {

  if (!existsSync(absoluteDirPath)) {
    throw new Error(`"${absoluteDirPath}" doesn't exist`);
  }

  if (!lstatSync(absoluteDirPath).isDirectory()) {
    throw new Error(`"${absoluteDirPath}" is not a directory!`);
  }

  const files: string[] = [];

  const dirEntries = readdirSync(absoluteDirPath);

  for (const entry of dirEntries) {
    const fullEntryPath = resolve(absoluteDirPath, entry);

    lstatSync(fullEntryPath).isDirectory()
      ? getRecursiveFilePaths(fullEntryPath).forEach(el => files.push(el))
      : files.push(fullEntryPath);
  }

  return files;
};

/** Returns a string with rewritten import/export paths with added extension */
export const addExtensions = (content: string, ext = "js") => (
  content.replace(
    new RegExp(`(?=(.)*/)(.*\\s+from\\s+['"])(.*)+(?=['"])(?<!\\.${ext})`, "g"),
    `$&.${ext}`
  )
);

/** Rewrites import/export paths with added extension for provided file */
export const addExtToFile = (absoluteFilePath: string, ext = "js") => {
  const fileContent = readFileSync(absoluteFilePath, { encoding: "utf-8" });
  const fileContentWithJsExtensions = addExtensions(fileContent, ext);
  writeFileSync(absoluteFilePath, fileContentWithJsExtensions);
};

/** Rewrites import/export paths with added extension for provided files array */
export const addExtToFiles = (absoluteFilePaths: string[], ext = "js") => (
  absoluteFilePaths.forEach(file => addExtToFile(file, ext))
);

/** Rewrites import/export paths with added extension for all files in provided directory */
export const addExtToFilesRecursive = (absoluteDirPath: string, ext = "js") => {
  const files = getRecursiveFilePaths(absoluteDirPath);
  addExtToFiles(files, ext);
};
