import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useMess } from './MessContext';

const ExpenseContext = createContext();

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
    const { user } = useAuth();
    const { mess } = useMess();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchExpenses = async () => {
        if (!mess) return;
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('/expenses/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(res.data);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        }
        setLoading(false);
    };

    const addExpense = async (amount, description, type, date, guests, paid_by) => {
        const token = localStorage.getItem('token');
        const res = await axios.post('/expenses/add',
            { amount, description, type, date, guests, paid_by },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchExpenses();
        return res.data;
    };

    const updateExpense = async (id, data) => {
        const token = localStorage.getItem('token');
        const res = await axios.put(`/expenses/${id}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchExpenses();
        return res.data;
    };

    const deleteExpense = async (id) => {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`/expenses/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchExpenses();
        return res.data;
    };

    return (
        <ExpenseContext.Provider value={{ expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, loading }}>
            {children}
        </ExpenseContext.Provider>
    );
};
