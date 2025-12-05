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

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Error getting session:', error);
                setError(error.message);
            }
            setSession(session);
            setUser(session?.user ?? null);
            checkAdmin(session?.user);
            setLoading(false);
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkAdmin(session?.user);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkAdmin = (user: User | null | undefined) => {
        if (user && user.email === 'salihaerdol11@gmail.com') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
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
