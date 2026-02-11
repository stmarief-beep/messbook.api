import { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';

const ViewEditExpenseModal = ({ expense, onClose, onUpdate }) => {
    const { updateExpense, deleteExpense } = useExpense();
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState(expense.amount);
    const [description, setDescription] = useState(expense.description);
    const [type, setType] = useState(expense.type);
    const [date, setDate] = useState(expense.date);
    const [guests, setGuests] = useState(expense.guests || 0);
    const [paidBy, setPaidBy] = useState(expense.user_id ? 'self' : 'guest');

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateExpense(expense.id, { amount, description, type, date, guests, paid_by: paidBy });
            alert('Expense updated successfully!');
            onClose();
        } catch (error) {
            alert('Failed to update expense: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await deleteExpense(expense.id);
            alert('Expense deleted successfully!');
            onClose();
        } catch (error) {
            alert('Failed to delete expense: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {isEditing ? 'Edit Expense' : 'Expense Details'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="text-lg font-semibold">{expense.amount} SAR</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-lg">{expense.description}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="text-lg">{expense.type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="text-lg">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Guests Participants</p>
                            <p className="text-lg">{expense.guests || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Paid By</p>
                            <p className={`text-lg font-bold ${expense.user_id ? 'text-gray-900' : 'text-teal-600'}`}>
                                {expense.added_by}
                            </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border rounded p-2"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-teal-700 font-bold">Paid By</label>
                            <select
                                className="w-full border-2 border-teal-200 rounded-lg p-2 bg-teal-50 focus:border-teal-500 outline-none"
                                value={paidBy}
                                onChange={e => setPaidBy(e.target.value)}
                            >
                                <option value="self">Member (Current)</option>
                                <option value="guest">Guest / Friend</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                className="w-full border rounded p-2"
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="Mess">Mess</option>
                                <option value="Shared">Shared</option>
                                <option value="General">General</option>
                                <option value="Utilities">Utilities</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full border rounded p-2"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 flex justify-between">
                                <span>Guests Participants</span>
                                <span className="text-xs text-gray-500 font-normal">(Shared with members + guests)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="w-full border rounded p-2"
                                value={guests}
                                onChange={e => setGuests(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ViewEditExpenseModal;
