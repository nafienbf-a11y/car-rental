import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_TRACKED_KEY = 'v_tracked_session';

export const useVisitorTracking = () => {
    useEffect(() => {
        const trackVisit = async () => {
            // Only track once per browser session
            if (sessionStorage.getItem(SESSION_TRACKED_KEY)) {
                return;
            }

            try {
                const today = new Date().toISOString().split('T')[0];
                
                // Try to get today's record
                const { data: existing } = await supabase
                    .from('visitor_stats')
                    .select('id, count')
                    .eq('visit_date', today)
                    .single();

                if (existing) {
                    await supabase
                        .from('visitor_stats')
                        .update({ count: existing.count + 1 })
                        .eq('id', existing.id);
                } else {
                    await supabase
                        .from('visitor_stats')
                        .insert([{ visit_date: today, count: 1 }]);
                }

                sessionStorage.setItem(SESSION_TRACKED_KEY, 'true');
            } catch (err) {
                console.error('Error tracking visitor:', err);
            }
        };

        trackVisit();
    }, []);
};
