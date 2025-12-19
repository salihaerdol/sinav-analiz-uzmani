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
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ getSession error:', error);
                    if ((error.message.includes('future') || error.message.includes('skew')) && retries > 0) {
                        console.warn('⏰ Clock skew detected. Retrying in 3s...');
                        setTimeout(() => checkSession(retries - 1), 3000);
                        return;
                    }
                    setError(error.message);
                }

                console.log('📡 getSession result:', {
                    hasSession: !!session,
                    user: session?.user?.email,
                    url: window.location.href
                });

                if (session) {
                    setSession(session);
                    setUser(session.user);
                    checkAdmin(session.user);
                    setLoading(false);
                } else {
                    if ((window.location.hash.includes('access_token') || window.location.search.includes('code')) && retries > 0) {
                        console.warn('🔑 Auth data found in URL but no session yet. Retrying in 2s...');
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

    return (
        <AuthContext.Provider value={{ user, session, isAdmin, signInWithGoogle, signOut, loading, error }}>
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
