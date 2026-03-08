import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

const SESSION_TRACKED_KEY = 'v_tracked_session';

export const useVisitorTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const trackVisit = async () => {
            // Only track once per browser session
            if (sessionStorage.getItem(SESSION_TRACKED_KEY)) {
                return;
            }

            try {
                // Get basic client info
                const userAgent = navigator.userAgent;

                // We'll record the initial landing page
                const page = location.pathname;

                const { error } = await supabase
                    .from('visitor_stats')
                    .insert([
                        { user_agent: userAgent, page: page }
                    ]);

                if (!error) {
                    sessionStorage.setItem(SESSION_TRACKED_KEY, 'true');
                } else {
                    console.error('Failed to log visit:', error);
                }
            } catch (err) {
                console.error('Error tracking visitor:', err);
            }
        };

        trackVisit();
        // We only want to run this once on mount/initial route
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
