import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // Session Timeout Logic
    useEffect(() => {
        let inactivityTimeout;

        const resetTimer = () => {
            if (user) {
                clearTimeout(inactivityTimeout);
                inactivityTimeout = setTimeout(() => {
                    alert('Session expired due to inactivity');
                    logout();
                }, 20 * 60 * 1000); // 20 minutes
            }
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        if (user) {
            resetTimer(); // Start timer on login
            events.forEach(event => window.addEventListener(event, resetTimer));
        }

        return () => {
            clearTimeout(inactivityTimeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user]);

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, groupCode) => {
        const res = await axios.post('/auth/register', { name, email, password, groupCode });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
