import { createCsrfResponse } from "../../../../lib/server/auth.js";

export const dynamic = "force-dynamic";

export async function GET() {
  return createCsrfResponse();
}
