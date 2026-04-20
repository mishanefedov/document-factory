import { listDocs } from "../lib/list-docs";
import EditorShell from "../components/EditorShell";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const docs = await listDocs();
  return <EditorShell initialDocs={docs} />;
}
