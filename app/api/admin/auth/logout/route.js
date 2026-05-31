import { clearSessionResponse } from "../../../../../lib/server/auth.js";

export async function POST() {
  return clearSessionResponse();
}
