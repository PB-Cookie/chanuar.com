import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { foodAuth } from '../api/foodApi';

export function useFoodSession(initialSession: Session | null | undefined) {
  const [session, setSession] = useState(initialSession);

  useEffect(() => {
    if (initialSession !== undefined) setSession(initialSession);
  }, [initialSession]);

  useEffect(() => {
    let mounted = true;
    if (initialSession === undefined) {
      foodAuth.session()
        .then((value) => { if (mounted) setSession(value); })
        .catch(() => { if (mounted) setSession(null); });
    }
    const unsubscribe = foodAuth.onChange(setSession);
    return () => { mounted = false; unsubscribe(); };
  }, [initialSession]);

  return [session, setSession] as const;
}
