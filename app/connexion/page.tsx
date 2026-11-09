import { redirect } from "next/navigation";
import AuthForm from "@/app/components/AuthForm";
import { getClientSession } from "@/lib/clientSession";
import { safeRedirect } from "@/lib/safeRedirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect);

  if (await getClientSession()) redirect(redirectTo);

  return <AuthForm mode="login" redirectTo={redirectTo} />;
}