const Module = require("module");
const path = require("path");

const dist = path.join(__dirname, "dist");
const original = Module._resolveFilename;

Module._resolveFilename = function resolveWithAliases(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(dist, request.slice(2));
  }
  return original.call(this, request, parent, isMain, options);
};
