import { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

const AddExpenseModal = ({ onClose }) => {
    const { addExpense } = useExpense();
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Mess'); // Default to Mess
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [guests, setGuests] = useState(0);
    const [paidBy, setPaidBy] = useState('self'); // 'self' or 'guest'

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addExpense(amount, description, type, date, guests, paidBy);
            onClose();
            alert('Expense added successfully!');
        } catch (error) {
            alert('Failed to add expense');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
                <form onSubmit={handleSubmit}>

                    {/* Amount */}
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

                    {/* Paid By */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-teal-700 font-bold">Paid By</label>
                        <select
                            className="w-full border-2 border-teal-200 rounded-lg p-2 bg-teal-50 focus:border-teal-500 outline-none"
                            value={paidBy}
                            onChange={e => setPaidBy(e.target.value)}
                        >
                            <option value="self">{user?.name || 'Me'} (Member)</option>
                            <option value="guest">Guest / Friend</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                            Choose "Guest" if the friend paid for this item themselves.
                        </p>
                    </div>

                    {/* Description */}
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

                    {/* Category (Type) */}
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

                    {/* Date */}
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

                    {/* Guests */}
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
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
