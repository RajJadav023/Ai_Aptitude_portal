import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider Component
 * Manages global authentication state, including user data, login/logout logic,
 * and automatic session expiration after 30 minutes of inactivity.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Loads user profile from the backend using the stored JWT token.
     */
    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/user');
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Idle Timer for Auto-Logout
    useEffect(() => {
        let timeout;
        const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            if (user) {
                timeout = setTimeout(() => {
                    logout();
                    alert("Session expired due to inactivity. Please login again.");
                }, INACTIVITY_LIMIT);
            }
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        
        if (user) {
            events.forEach(event => window.addEventListener(event, resetTimer));
            resetTimer();
        }

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        await loadUser();
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        await loadUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
