import { useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';

const ExpenseListCompact = ({ onExpenseClick, filter }) => {
    const { expenses } = useExpense();

    const filteredExpenses = filter ? expenses.filter(filter) : expenses;

    if (!filteredExpenses || filteredExpenses.length === 0) {
        return <p className="text-gray-500 italic">No expenses recorded yet.</p>;
    }

    return (
        <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredExpenses.slice(0, 5).map(expense => (
                <div
                    key={expense.id}
                    onClick={() => onExpenseClick && onExpenseClick(expense)}
                    className="border-l-4 border-blue-500 bg-white shadow-sm p-3 rounded cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-gray-800">{expense.description}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(expense.date).toLocaleDateString()} • <span className="text-blue-600">{expense.type}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900">{expense.amount} SAR</p>
                            <p className="text-xs text-gray-400">by {expense.added_by}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ExpenseListCompact;
