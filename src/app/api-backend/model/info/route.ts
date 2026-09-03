import { json } from "@/server/http";
import { getModelInfo } from "@/server/model";

/** Metadata for the embedded pipeline and the two scores it backs. */
export function GET() {
  return json(getModelInfo());
}
