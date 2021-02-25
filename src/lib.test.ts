import { mkdirSync, readFileSync, rmdirSync, writeFileSync } from "fs";
import { resolve } from "path";

import {
  addExtensions,
  addExtToFile,
  addExtToFiles,
  addExtToFilesRecursive,
  getRecursiveFilePaths,
} from "./lib";

const rootDir = resolve(__dirname, "..");
const tmpFolder = resolve(rootDir, "tmp");
const nestedFolder = resolve(tmpFolder, "nested-folder");
const nestedFolderLevel2 = resolve(nestedFolder, "nested-folder-level-2");
const nestedFolderLevel3 = resolve(nestedFolderLevel2, "nested-folder-level-3");

const files = {
  file1: {
    path: resolve(tmpFolder, "test.js"),
    content: "export { test } from './nested-folder/test2';"
  },
  file2: {
    path: resolve(nestedFolder, "test2.js"),
    content: `
      import { test } from "./nested-folder-level-2/test3";
      export { test };
  `
  },
  file3: {
    path: resolve(nestedFolderLevel2, "test3.js"),
    content: "export const test = 1;\n"
  },
  file4: {
    path: resolve(nestedFolderLevel3, "test4.js"),
    content: "import { test } from '../test3'\n"
  },
  file5: {
    path: resolve(tmpFolder, "test5.js"),
    content: `
      import { resolve } from "path";
      const text = "hello world";
      console.log(text);
  `
  }
};

const resultFiles: typeof files = JSON.parse(JSON.stringify(files));

resultFiles.file1.content = files.file1.content.replace("/test2", "/test2.js");
resultFiles.file2.content = files.file2.content.replace("/test3", "/test3.js");
resultFiles.file4.content = files.file4.content.replace("/test3", "/test3.js");

const setup = () => {

  mkdirSync(tmpFolder);
  mkdirSync(nestedFolder);
  mkdirSync(nestedFolderLevel2);
  mkdirSync(nestedFolderLevel3);

  Object.values(files).forEach(el => writeFileSync(el.path, el.content));
};

const cleanup = () => rmdirSync(tmpFolder, { recursive: true });

describe("getRecursiveFilePaths tests", () => {
  beforeAll(setup);
  afterAll(cleanup);

  test("should return 5 files", () => {
    const paths = getRecursiveFilePaths(tmpFolder);

    expect(paths.length).toBe(5);
  });

  test("should throw error if dir doesn't exist", () => {
    expect(() => getRecursiveFilePaths("./random")).toThrowError();
  });

  test("should throw error if provided path is not a directory", () => {
    expect(() => getRecursiveFilePaths(files.file1.path)).toThrowError();
  });
});

describe("addExtensions tests", () => {

  test("should add js extension to content", () => {
    const content = addExtensions(files.file2.content);

    expect(content).toBe(resultFiles.file2.content);
  });

  test("should not change bare imports form node_modules", () => {
    const content = addExtensions(files.file5.content);

    expect(content).toBe(resultFiles.file5.content);
  });

});

describe("addExtToFile tests", () => {
  beforeAll(setup);
  afterAll(cleanup);

  test("should add js extension to file", () => {
    addExtToFile(files.file1.path);

    const content = readFileSync(files.file1.path, { encoding: "utf-8" });

    expect(content).toBe(resultFiles.file1.content);
  });

  test("should not add js extension to file", () => {
    addExtToFile(files.file5.path);

    const content = readFileSync(files.file5.path, { encoding: "utf-8" });

    expect(content).toBe(resultFiles.file5.content);
  });

});

describe("addExtToFiles tests", () => {
  beforeAll(setup);
  afterAll(cleanup);

  test("all results should return expected output", () => {
    addExtToFiles(Object.values(files).map(el => el.path));

    const resultFiles = getRecursiveFilePaths(tmpFolder).map(el => ({
      path: el,
      content: readFileSync(el, { encoding: "utf-8" })
    })).sort((a, b) => {
      const aNum = +(a.path.replace(/\D/g, ''));
      const bNum = +(b.path.replace(/\D/g, ''));
      return aNum - bNum;
    });

    const expectedResults = Object.values(resultFiles);

    expect(resultFiles).toStrictEqual(expectedResults);
  });

});

describe("addExtToFilesRecursive tests", () => {
  beforeAll(setup);
  afterAll(cleanup);

  test("all results should return expected output", () => {
    addExtToFilesRecursive(tmpFolder);

    const resultFiles = getRecursiveFilePaths(tmpFolder).map(el => ({
      path: el,
      content: readFileSync(el, { encoding: "utf-8" })
    })).sort((a, b) => {
      const aNum = +(a.path.replace(/\D/g, ''));
      const bNum = +(b.path.replace(/\D/g, ''));
      return aNum - bNum;
    });

    const expectedResults = Object.values(resultFiles);

    expect(resultFiles).toStrictEqual(expectedResults);
  });

});
