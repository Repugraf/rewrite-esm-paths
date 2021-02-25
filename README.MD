# Rewrite ESM Paths

This issue this package is solving mostly caused typescript inability to rewrite imports/exports when building to esm target.

***
### Example
This TypeScript code:

```ts
import Package from "./package";
```
Will stay the same when built to esm. This will not work when running inside nodejs in esm context.

Here is the desired output:
```js
import Package from "./package.js";
```

More info about this issue can be found on this [thread](https://github.com/microsoft/TypeScript/issues/16577)
***

### Usage
```js
import { resolve } from "fs";
import { addExtToFilesRecursive } from "@repugraf/rewrite-esm-paths";

const absoluteDirectoryPath = resolve(__dirname, "..", "lib", "esm");

addExtToFilesRecursive(absoluteDirectoryPath, "js");
```

### Caveats
- The package will not follow `index.js` imports. You need to specify full path to your files in your imports
- Bare imports from `node_modules` will stay unchanged