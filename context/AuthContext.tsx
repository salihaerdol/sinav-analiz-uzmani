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

        const checkSession = async (retries = 3) => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log(`📡 getSession result (attempt ${4 - retries}):`, { session: !!session, error });

                if (error) {
                    if (error.message.includes('future') && retries > 0) {
                        console.warn('⏰ Clock skew detected (token issued in future). Retrying in 2s...');
                        setTimeout(() => checkSession(retries - 1), 2000);
                        return;
                    }
                    console.error('Error getting session:', error);
                    setError(error.message);
                }

                setSession(session);
                setUser(session?.user ?? null);
                checkAdmin(session?.user);
                setLoading(false);
            } catch (err: any) {
                console.error('Unexpected error in checkSession:', err);
                setLoading(false);
            }
        };

        console.log('🏁 Initial session check starting...');
        checkSession();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state change:', event, { session: !!session });
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

            // Clear hash from URL after successful sign in
            if (event === 'SIGNED_IN' && window.location.hash) {
                console.log('🧹 Clearing hash from URL');
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
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
