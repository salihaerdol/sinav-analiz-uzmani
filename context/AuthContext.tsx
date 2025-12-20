import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAdmin = (user: User | null | undefined) => {
        if (user && user.email === 'salihaerdol11@gmail.com') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        console.log('🔐 AuthProvider mounted. Checking session...');
        console.log('📍 Current URL:', window.location.href);
        console.log('📍 Current Hash:', window.location.hash ? 'Present' : 'None');
        console.log('📍 Current Search:', window.location.search ? 'Present' : 'None');

        const checkSession = async (retries = 5) => {
            try {
                console.log(`📡 Checking session... (retries left: ${retries})`);

                // Try to get session normally
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('❌ getSession error:', sessionError);

                    // Handle clock skew
                    if ((sessionError.message.includes('future') || sessionError.message.includes('skew')) && retries > 0) {
                        console.warn('⏰ Clock skew detected. Retrying in 3s...');
                        setTimeout(() => checkSession(retries - 1), 3000);
                        return;
                    }
                    setError(sessionError.message);
                }

                console.log('📡 getSession result:', {
                    hasSession: !!currentSession,
                    user: currentSession?.user?.email,
                    url: window.location.href
                });

                if (currentSession) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                    checkAdmin(currentSession.user);
                    setLoading(false);
                } else {
                    // FALLBACK: Manual session recovery from URL hash/search
                    const hasAuthParams = window.location.hash.includes('access_token') || window.location.search.includes('code');

                    if (hasAuthParams && retries > 0) {
                        console.warn('🔑 Auth data found in URL but no session yet. Attempting manual recovery...');

                        // If we have a hash, try to set session manually
                        if (window.location.hash.includes('access_token')) {
                            const params = new URLSearchParams(window.location.hash.substring(1));
                            const access_token = params.get('access_token');
                            const refresh_token = params.get('refresh_token');

                            if (access_token) {
                                console.log('🛠 Attempting manual setSession...');
                                const { data: manualData, error: manualError } = await supabase.auth.setSession({
                                    access_token,
                                    refresh_token: refresh_token || '',
                                });

                                if (manualData.session) {
                                    console.log('✅ Manual session recovery successful!');
                                    setSession(manualData.session);
                                    setUser(manualData.session.user);
                                    checkAdmin(manualData.session.user);
                                    setLoading(false);
                                    return;
                                }

                                if (manualError) {
                                    console.error('❌ Manual recovery failed:', manualError);
                                }
                            }
                        }

                        console.warn('⏳ Retrying checkSession in 2s...');
                        setTimeout(() => checkSession(retries - 1), 2000);
                        return;
                    }
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('Unexpected error in checkSession:', err);
                setLoading(false);
            }
        };

        checkSession();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state change event:', event);
            console.log('🔄 Auth state change session:', !!session);

            if (session) {
                setSession(session);
                setUser(session.user);
                checkAdmin(session.user);
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);

            // Clear hash/search from URL after successful sign in
            if (event === 'SIGNED_IN' && (window.location.hash || window.location.search)) {
                console.log('🧹 Clearing auth params from URL');
                window.history.replaceState(null, '', window.location.pathname);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            setError(error.message || 'Giriş yapılırken bir hata oluştu.');
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error: any) {
            console.error('Error signing out:', error);
            setError(error.message || 'Çıkış yapılırken bir hata oluştu.');
        }
    };

    // Guest user fallback
    const guestUser: User = {
        id: 'guest-user',
        email: 'misafir@sinavanaliz.com',
        app_metadata: {},
        user_metadata: { full_name: 'Misafir Kullanıcı' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
    } as User;

    return (
        <AuthContext.Provider value={{
            user: user || guestUser,
            session,
            isAdmin: isAdmin || (user?.email === 'salihaerdol11@gmail.com'),
            signInWithGoogle,
            signOut,
            loading: false, // Force loading to false to show the app
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
