import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabaseServerClient";
import { getOrCreateRestaurantForUser } from "@/lib/supabaseClient";
import type { Locale } from "@/lib/i18n";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({ params }: { params: { locale: Locale } }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  const restaurantId = await getOrCreateRestaurantForUser(user.id, user.email ?? null);

  return <DashboardClient params={params} restaurantId={restaurantId} />;
}
