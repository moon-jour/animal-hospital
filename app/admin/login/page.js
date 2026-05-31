import { redirect } from "next/navigation";

import { getAdminSession } from "../../../lib/server/auth.js";
import LoginForm from "./LoginForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  const session = await getAdminSession();
  const params = await searchParams;

  if (session) {
    redirect("/admin/reviews");
  }

  return (
    <main className="admin-page">
      <LoginForm error={params?.error} />
    </main>
  );
}
