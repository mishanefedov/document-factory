/**
 * Public types for @document-factory/core.
 *
 * Design: stateless, string-in/string-out. No filesystem, no network.
 */

export interface DocSpec {
  /** Doc type, e.g. "case-study", "one-pager". Derived from frontmatter.type. */
  type: string;
  /** Parsed frontmatter. */
  frontmatter: Record<string, unknown>;
  /** Section-granular parse. */
  sections: Section[];
  /** Original MDX source, for round-tripping. */
  raw: string;
}

export interface Section {
  /** Stable, slug-based id derived from heading + index. */
  id: string;
  /** Heading text; null for a prologue section before any heading. */
  heading: string | null;
  /** Heading level 1-6; 0 for prologue. */
  level: number;
  /** Serialized MDX of the section body (without heading). */
  body: string;
  /** Components referenced in this section. */
  components: ComponentUsage[];
}

export interface ComponentUsage {
  /** Stable id for this component usage (hash of section + position + name). */
  id: string;
  /** Component name, e.g. "StatRow". */
  name: string;
  /** Attribute -> literal value (string, number, boolean). Complex expressions unsupported in v0.2. */
  props: Record<string, string | number | boolean>;
  /** Raw MDX of the element, including children. */
  raw: string;
}

export interface Brand {
  name: string;
  domain: string;
  tokens: {
    colors: Record<string, string>;
    fonts: { display: string; body: string; mono?: string };
    logo?: { svg?: string; png?: string };
    spacing?: Record<string, string>;
  };
  voice?: { tone: string; avoid: string[]; prefer: string[] };
}

export interface ComponentRegistry {
  [name: string]: ComponentDefinition;
}

export interface ComponentDefinition {
  /** HTML template. Supports {{prop.X}} interpolation. */
  html: string;
  /** Optional scoped CSS. */
  css?: string;
  /** JSON-schema-like prop schema (subset — v0.2 only requires `required` + `type`). */
  propSchema: PropSchema;
}

export interface PropSchema {
  type: "object";
  required?: string[];
  properties: {
    [propName: string]: {
      type: "string" | "number" | "boolean";
      description?: string;
    };
  };
}

export interface DocTypeSchema {
  /** Doc type id, e.g. "case-study". Must match DocSpec.type. */
  id: string;
  label: string;
  description?: string;
  /** Frontmatter fields required for this doc type. */
  requiredFrontmatter: string[];
  /** Recommended section headings (not enforced, used for agent hints). */
  recommendedSections?: string[];
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code:
    | "MISSING_FRONTMATTER"
    | "UNKNOWN_COMPONENT"
    | "COMPONENT_MISSING_PROP"
    | "COMPONENT_BAD_PROP_TYPE"
    | "UNKNOWN_DOC_TYPE";
  message: string;
  /** Optional path into the DocSpec (section id, component id, etc.). */
  path?: string;
}

export interface ValidationWarning {
  code: "MISSING_RECOMMENDED_SECTION" | "UNUSED_COMPONENT" | "LONG_SECTION";
  message: string;
  path?: string;
}

export interface ResolvedDoc {
  spec: DocSpec;
  brand: Brand;
  /** Components keyed by component id, with props substituted into HTML. */
  resolvedComponents: { [componentId: string]: { html: string; css?: string } };
  /** Brand-token-substituted section bodies (markdown, components replaced with component ids). */
  resolvedSections: { id: string; heading: string | null; level: number; bodyHtml: string }[];
}

export interface RenderOpts {
  /** Inline all CSS into a <style> block. Default true. */
  inlineCSS?: boolean;
  /** Strip HTML comments from output. Default false. */
  stripComments?: boolean;
  /** Minify whitespace. Default false. */
  minify?: boolean;
  /** Base64-inline font files referenced in brand tokens. Default false. */
  embedFonts?: boolean;
  /** Wrap in a full <html>/<body> doc (true) or return a fragment (false). Default true. */
  fullDocument?: boolean;
}

export interface RenderedDoc {
  html: string;
  meta: {
    wordCount: number;
    sectionCount: number;
    components: { name: string; count: number }[];
    renderMs: number;
  };
}
