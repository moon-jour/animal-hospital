import { redirect } from "next/navigation";

import { getAdminSession } from "../../../lib/server/auth.js";
import LoginForm from "./LoginForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/reviews");
  }

  return (
    <main className="admin-page">
      <LoginForm />
    </main>
  );
}
