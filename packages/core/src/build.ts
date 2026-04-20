/**
 * build.ts — end-to-end convenience: MDX source -> RenderedDoc.
 */

import { parse } from "./parse.js";
import { resolve as resolveDoc } from "./resolve.js";
import { render } from "./render.js";

import type {
  Brand,
  ComponentRegistry,
  RenderOpts,
  RenderedDoc,
} from "./types.js";

export function build(
  source: string,
  brand: Brand,
  components: ComponentRegistry,
  opts?: RenderOpts
): RenderedDoc {
  const spec = parse(source);
  const resolved = resolveDoc(spec, brand, components);
  return render(resolved, opts);
}
