import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMess } from '../context/MessContext';
import { useNavigate } from 'react-router-dom';
import AddExpenseModal from '../components/AddExpenseModal';
import ViewEditExpenseModal from '../components/ViewEditExpenseModal';
import ExpenseSummaryCard from '../components/ExpenseSummaryCard';
import CategoryCard from '../components/CategoryCard';
import ContributorChart from '../components/ContributorChart';
import ExpenseListCompact from '../components/ExpenseListCompact';
import { useExpense } from '../context/ExpenseContext';
import SharedExpensesModal from '../components/SharedExpensesModal';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { mess, loading: messLoading } = useMess();
    const { fetchDashboardData, loadingDashboard } = useExpense();
    const navigate = useNavigate();

    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showSharedModal, setShowSharedModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    // Form States
    const [messName, setMessName] = useState('');
    const [rules, setRules] = useState('');
    const [messCode, setMessCode] = useState('');

    const { createMess, joinMess } = useMess();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createMess(messName, rules);
            setShowCreate(false);
        } catch (error) {
            console.error(error);
            alert('Failed to create mess: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            await joinMess(messCode);
            setShowJoin(false);
        } catch (error) {
            alert('Failed to join mess: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    useEffect(() => {
        if (mess) {
            fetchDashboardData();
        }
    }, [mess]);

    if (messLoading || loadingDashboard) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    // If no mess, show join/create options
    if (!mess) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
                            <p className="text-gray-600">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout} className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800">
                            Logout
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-transparent hover:border-blue-500 transition-all">
                            <h2 className="text-xl font-semibold mb-4">Create New Mess</h2>
                            <p className="mb-4 text-gray-600">Start a new mess group and invite friends.</p>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                            >
                                Create Mess
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-transparent hover:border-green-500 transition-all">
                            <h2 className="text-xl font-semibold mb-4">Join Existing Mess</h2>
                            <p className="mb-4 text-gray-600">Enter a code to join your friends' mess.</p>
                            <button
                                onClick={() => setShowJoin(true)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                            >
                                Join Mess
                            </button>
                        </div>
                    </div>

                    {/* Modals */}
                    {showCreate && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Create New Mess</h2>
                                <form onSubmit={handleCreate}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Mess Name</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded p-2"
                                            value={messName}
                                            onChange={e => setMessName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Rules (Optional)</label>
                                        <textarea
                                            className="w-full border rounded p-2"
                                            value={rules}
                                            onChange={e => setRules(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showJoin && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Join Existing Mess</h2>
                                <form onSubmit={handleJoin}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Mess Code</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded p-2 uppercase"
                                            value={messCode}
                                            onChange={e => setMessCode(e.target.value.toUpperCase())}
                                            placeholder="Enter 6-digit code"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowJoin(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Join</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main Dashboard with new UI
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div
                        onClick={() => navigate('/profile')}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <h1 className="text-2xl font-bold">Welcome !</h1>
                        <p className="text-gray-600 flex items-center gap-1">
                            {user?.name}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                            {new Date().toLocaleString('default', { month: 'short' })}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Total Expenses Card */}
                <div className="mb-6">
                    <ExpenseSummaryCard />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center md:gap-3 gap-2 text-center md:text-left group border border-transparent hover:border-teal-500"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors shrink-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 leading-tight">Add Expense</span>
                    </button>

                    <button
                        onClick={() => navigate('/settlements')}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center md:gap-3 gap-2 text-center md:text-left group border border-transparent hover:border-teal-500"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors shrink-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 leading-tight">Settlements</span>
                    </button>

                    <button
                        onClick={() => navigate('/report')}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center md:gap-3 gap-2 text-center md:text-left group border border-transparent hover:border-teal-500"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors shrink-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 leading-tight">Report</span>
                    </button>

                    <button
                        onClick={() => setShowSharedModal(true)}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center md:gap-3 gap-2 text-center md:text-left group border border-transparent hover:border-indigo-500"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 group-hover:text-white transition-colors shrink-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 leading-tight">Shared</span>
                    </button>
                </div>

                {/* Categories and Contributors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <CategoryCard />
                    <ContributorChart />
                </div>

                {/* Recent Expenses Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mess Expenses */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Mess Expenses</h3>
                        </div>
                        <ExpenseListCompact
                            onExpenseClick={(expense) => setSelectedExpense(expense)}
                            filter={(e) => e.type !== 'Shared'}
                        />
                    </div>

                    {/* Shared Expenses */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-indigo-800">Recent Shared Expenses</h3>
                            <button
                                onClick={() => setShowSharedModal(true)}
                                className="text-indigo-700 text-sm font-medium hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <ExpenseListCompact
                            onExpenseClick={(expense) => setSelectedExpense(expense)}
                            filter={(e) => e.type === 'Shared'}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddExpense && <AddExpenseModal onClose={() => {
                setShowAddExpense(false);
                fetchDashboardData();
            }} />}

            {selectedExpense && (
                <ViewEditExpenseModal
                    expense={selectedExpense}
                    onClose={() => setSelectedExpense(null)}
                    onUpdate={() => {
                        fetchDashboardData();
                        setSelectedExpense(null);
                    }}
                />
            )}

            {showSharedModal && <SharedExpensesModal onClose={() => setShowSharedModal(false)} />}
        </div>
    );
};

export default Dashboard;
