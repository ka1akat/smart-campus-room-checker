// Assignment 05, mitigation M2 (risk R2): the documented Node.js version must match what the tools need.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const pkg = JSON.parse(read("package.json"));
const jsdomPkg = JSON.parse(read("node_modules/jsdom/package.json"));

test("R2 package.json declares the same Node.js range that jsdom requires", () => {
  assert.equal(pkg.engines?.node, jsdomPkg.engines.node);
});
test("R2 .npmrc makes npm refuse an unsupported Node.js version", () => {
  assert.match(read(".npmrc"), /^engine-strict=true$/m);
});
test("R2 .nvmrc and README name a supported version, not Node 18", () => {
  assert.equal(read(".nvmrc").trim(), "22");
  assert.doesNotMatch(read("README.md"), /Node\.js 18/);
  assert.match(read("README.md"), /22\.22\.2/);
});
test("R2 the Node.js running the tests is at least 22.22.2", () => {
  const [major, minor, patch] = process.versions.node.split(".").map(Number);
  const ok = major >= 26 || (major === 24 && minor >= 15) || (major === 22 && (minor > 22 || (minor === 22 && patch >= 2)));
  assert.ok(ok, `Node ${process.versions.node} is outside ${pkg.engines.node}`);
});
