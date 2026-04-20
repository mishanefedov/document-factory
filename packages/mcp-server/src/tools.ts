/**
 * tools.ts — MCP tool definitions + handlers.
 *
 * Each tool: { name, description, inputSchema (JSONSchema7), handler }.
 * Handlers receive validated args and return a result object or throw a
 * WorkspaceError with a code from the E_* set.
 */

import { parse, validate, build, resolve as resolveDoc } from "@document-factory/core";
import type { Brand, ComponentRegistry, DocTypeSchema } from "@document-factory/core";

import { Workspace, WorkspaceError } from "./workspace.js";

export interface ToolContext {
  workspace: Workspace;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
}

// ─── Shared loaders ──────────────────────────────────────────────────────────

async function loadBrand(ctx: ToolContext): Promise<Brand> {
  if (await ctx.workspace.exists("brand.json")) {
    return ctx.workspace.readJson<Brand>("brand.json");
  }
  // Minimal default so operations still work before brand is configured.
  return {
    name: "Untitled",
    domain: "example.com",
    tokens: {
      colors: { primary: "#111111", secondary: "#666666" },
      fonts: { display: "system-ui", body: "system-ui" },
    },
  };
}

async function loadComponents(ctx: ToolContext): Promise<ComponentRegistry> {
  if (await ctx.workspace.exists("components/registry.json")) {
    return ctx.workspace.readJson<ComponentRegistry>("components/registry.json");
  }
  return {};
}

async function loadDocTypes(ctx: ToolContext): Promise<DocTypeSchema[]> {
  const files = await ctx.workspace.listFiles("doc-types", ".json");
  const out: DocTypeSchema[] = [];
  for (const f of files) {
    try {
      out.push(await ctx.workspace.readJson<DocTypeSchema>(f));
    } catch {
      // Skip malformed schema files; lint will surface them separately.
    }
  }
  return out;
}

function docPath(slug: string): string {
  return `results/${slug}.mdx`;
}

function slugify(title: string, type: string): string {
  const base = (title || type)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `${date}-${type}-${base}`.slice(0, 96);
}

// ─── Tools ──────────────────────────────────────────────────────────────────

const list_doc_types: ToolDefinition = {
  name: "list_doc_types",
  description:
    "List all available doc-type schemas from the workspace. Call once at session start to discover what documents you can produce.",
  inputSchema: { type: "object", properties: {} },
  async handler(_args, ctx) {
    const types = await loadDocTypes(ctx);
    return { doc_types: types };
  },
};

const list_components: ToolDefinition = {
  name: "list_components",
  description:
    "List all registered components with prop schemas. Use this to know what components are available for insert_component.",
  inputSchema: { type: "object", properties: {} },
  async handler(_args, ctx) {
    const reg = await loadComponents(ctx);
    return {
      components: Object.entries(reg).map(([name, def]) => ({
        name,
        prop_schema: def.propSchema,
        has_css: Boolean(def.css),
      })),
    };
  },
};

const list_documents: ToolDefinition = {
  name: "list_documents",
  description: "List documents previously created in the workspace (under results/).",
  inputSchema: { type: "object", properties: {} },
  async handler(_args, ctx) {
    const files = await ctx.workspace.listFiles("results", ".mdx");
    const docs: { slug: string; type: string; title: string; path: string }[] = [];
    for (const f of files) {
      const slug = f.replace(/^results\//, "").replace(/\.mdx$/, "");
      try {
        const src = await ctx.workspace.read(f);
        const spec = parse(src);
        docs.push({
          slug,
          type: spec.type,
          title:
            (spec.frontmatter.title as string | undefined) ||
            spec.sections.find((s) => s.heading)?.heading ||
            slug,
          path: f,
        });
      } catch {
        // Skip unparseable docs; leave them for the user to repair.
      }
    }
    return { documents: docs };
  },
};

const describe_brand: ToolDefinition = {
  name: "describe_brand",
  description: "Return the brand tokens + voice configuration for this workspace.",
  inputSchema: { type: "object", properties: {} },
  async handler(_args, ctx) {
    return { brand: await loadBrand(ctx) };
  },
};

const read_document: ToolDefinition = {
  name: "read_document",
  description: "Read the raw MDX source of a document by slug.",
  inputSchema: {
    type: "object",
    required: ["slug"],
    properties: { slug: { type: "string" } },
  },
  async handler(args, ctx) {
    const slug = requireString(args, "slug");
    const src = await ctx.workspace.read(docPath(slug));
    return { slug, mdx: src };
  },
};

const create_document: ToolDefinition = {
  name: "create_document",
  description:
    "Create a new MDX document. Returns the slug and path. Optional: provide slug (auto-generated from title+type otherwise) and initial MDX body.",
  inputSchema: {
    type: "object",
    required: ["type", "frontmatter"],
    properties: {
      type: { type: "string", description: "Doc type, e.g. 'case-study'." },
      slug: { type: "string" },
      frontmatter: {
        type: "object",
        description: "Frontmatter fields (title, client, outcome, etc.).",
      },
      initial_content: {
        type: "string",
        description: "Optional MDX body. If omitted, a minimal skeleton is written.",
      },
    },
  },
  async handler(args, ctx) {
    const type = requireString(args, "type");
    const fm = args.frontmatter as Record<string, unknown> | undefined;
    if (!fm || typeof fm !== "object")
      throw new WorkspaceError("E_WORKSPACE", "frontmatter must be an object");
    const title = typeof fm.title === "string" ? fm.title : "";
    const slug = typeof args.slug === "string" && args.slug ? args.slug : slugify(title, type);
    const path = docPath(slug);
    if (await ctx.workspace.exists(path)) {
      throw new WorkspaceError("E_WORKSPACE", `Document "${slug}" already exists.`);
    }
    const body =
      typeof args.initial_content === "string"
        ? args.initial_content
        : `# ${title || "Untitled"}\n\nDraft body.\n`;
    const frontYaml = Object.entries({ type, ...fm })
      .map(([k, v]) =>
        typeof v === "string" ? `${k}: ${JSON.stringify(v)}` : `${k}: ${JSON.stringify(v)}`
      )
      .join("\n");
    const source = `---\n${frontYaml}\n---\n\n${body}`;
    await ctx.workspace.write(path, source);
    const spec = parse(source);
    const r = validate(spec, { components: await loadComponents(ctx) });
    return { slug, path, validation: r };
  },
};

const update_document: ToolDefinition = {
  name: "update_document",
  description: "Replace the full MDX source of a document.",
  inputSchema: {
    type: "object",
    required: ["slug", "mdx"],
    properties: {
      slug: { type: "string" },
      mdx: { type: "string" },
    },
  },
  async handler(args, ctx) {
    const slug = requireString(args, "slug");
    const mdx = requireString(args, "mdx");
    // Validate before writing.
    const spec = parse(mdx);
    const r = validate(spec, { components: await loadComponents(ctx) });
    await ctx.workspace.write(docPath(slug), mdx);
    return { slug, validation: r };
  },
};

const delete_document: ToolDefinition = {
  name: "delete_document",
  description: "Delete a document by slug.",
  inputSchema: {
    type: "object",
    required: ["slug"],
    properties: { slug: { type: "string" } },
  },
  async handler(args, ctx) {
    const slug = requireString(args, "slug");
    await ctx.workspace.remove(docPath(slug));
    return { ok: true, slug };
  },
};

const render_doc: ToolDefinition = {
  name: "render",
  description: "Render a document to HTML. Returns the full HTML string and metadata.",
  inputSchema: {
    type: "object",
    required: ["slug"],
    properties: { slug: { type: "string" } },
  },
  async handler(args, ctx) {
    const slug = requireString(args, "slug");
    const src = await ctx.workspace.read(docPath(slug));
    const brand = await loadBrand(ctx);
    const components = await loadComponents(ctx);
    const out = build(src, brand, components);
    return { slug, html: out.html, meta: out.meta };
  },
};

const validate_doc: ToolDefinition = {
  name: "validate",
  description: "Validate a document against its doc-type schema and component registry.",
  inputSchema: {
    type: "object",
    required: ["slug"],
    properties: { slug: { type: "string" } },
  },
  async handler(args, ctx) {
    const slug = requireString(args, "slug");
    const src = await ctx.workspace.read(docPath(slug));
    const spec = parse(src);
    const docTypes = await loadDocTypes(ctx);
    const schema = docTypes.find((t) => t.id === spec.type);
    const components = await loadComponents(ctx);
    const r = validate(spec, { docTypeSchema: schema, components });
    return { slug, validation: r };
  },
};

// ─── Exports ────────────────────────────────────────────────────────────────

export const tools: ToolDefinition[] = [
  list_doc_types,
  list_components,
  list_documents,
  describe_brand,
  read_document,
  create_document,
  update_document,
  delete_document,
  render_doc,
  validate_doc,
];

export function findTool(name: string): ToolDefinition | undefined {
  return tools.find((t) => t.name === name);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function requireString(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== "string" || v.length === 0) {
    throw new WorkspaceError("E_WORKSPACE", `Missing or invalid argument: ${key}`);
  }
  return v;
}

// Silence "unused import" warning for resolveDoc when added in v0.2.1.
void resolveDoc;
