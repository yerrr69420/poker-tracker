import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/sign-in');
  }
}
