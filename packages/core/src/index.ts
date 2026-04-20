/**
 * @document-factory/core — public exports.
 */

export { parse } from "./parse.js";
export { validate } from "./validate.js";
export { resolve } from "./resolve.js";
export { render } from "./render.js";
export { build } from "./build.js";

export type {
  Brand,
  ComponentDefinition,
  ComponentRegistry,
  ComponentUsage,
  DocSpec,
  DocTypeSchema,
  PropSchema,
  RenderOpts,
  RenderedDoc,
  ResolvedDoc,
  Section,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from "./types.js";

export type { ValidateOpts } from "./validate.js";
