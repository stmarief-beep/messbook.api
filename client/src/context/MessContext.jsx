import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const MessContext = createContext();

export const useMess = () => useContext(MessContext);

export const MessProvider = ({ children }) => {
    const { user } = useAuth();
    const [mess, setMess] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMyMess = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get('/mess/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMess(res.data.mess ? res.data : null); // data structure: { mess: {...}, isAdmin: bool, members: [] }
            } catch (error) {
                console.error("Failed to fetch mess", error);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchMyMess();
        }
    }, [user]);

    const createMess = async (name, rules) => {
        const token = localStorage.getItem('token');
        const res = await axios.post('/mess/create', { name, rules }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await fetchMyMess();
        return res.data;
    };

    const joinMess = async (code) => {
        const token = localStorage.getItem('token');
        const res = await axios.post('/mess/join', { code }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await fetchMyMess();
        return res.data;
    };

    return (
        <MessContext.Provider value={{ mess, createMess, joinMess, fetchMyMess, loading }}>
            {children}
        </MessContext.Provider>
    );
};
