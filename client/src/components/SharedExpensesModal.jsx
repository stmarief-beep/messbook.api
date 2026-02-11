import { useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';

const SharedExpensesModal = ({ onClose }) => {
    const { expenses, fetchExpenses } = useExpense();

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Filter shared expenses
    const sharedExpenses = expenses.filter(e => e.type === 'Shared');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Shared Expenses</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {sharedExpenses.length > 0 ? (
                        sharedExpenses.map(expense => (
                            <div key={expense.id} className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">{expense.description}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(expense.date).toLocaleDateString()} • {expense.user_id === null ? 'Paid by Guest' : `Paid by Member`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-indigo-900">{expense.amount} SAR</p>
                                        <p className="text-xs text-gray-500">Guests: {expense.guests}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>No shared expenses recorded yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharedExpensesModal;
