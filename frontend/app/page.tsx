import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("role")?.value;

  if (!token) {
    redirect("/signin");
  }

  redirect(role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
}
