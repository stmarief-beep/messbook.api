import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MonthSelector from '../components/MonthSelector';

const SettlementsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [settlementData, setSettlementData] = useState(null);
    const [savedSettlements, setSavedSettlements] = useState([]);

    // Default to current month/year
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchSettlements();
        fetchSavedSettlements();
    }, [selectedMonth, selectedYear]);

    const fetchSettlements = async () => {
        try {
            // setLoading(true); // Optional: show loading on date change
            const token = localStorage.getItem('token');
            const res = await axios.get('/settlements/calculate', {
                headers: { Authorization: `Bearer ${token}` },
                params: { month: selectedMonth, year: selectedYear }
            });
            setSettlementData(res.data);
        } catch (error) {
            console.error('Failed to fetch settlements', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedSettlements = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/settlements/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedSettlements(res.data);
        } catch (error) {
            console.error('Failed to fetch saved settlements', error);
        }
    };

    const handleDateChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const handleMarkAsPaid = async (settlementId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/settlements/mark-paid/${settlementId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Settlement marked as paid!');
            fetchSavedSettlements();
        } catch (error) {
            alert('Failed to mark as paid: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSaveSettlement = async (settlement) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/settlements/save', settlement, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Settlement saved!');
            fetchSavedSettlements();
        } catch (error) {
            alert('Failed to save settlement: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading && !settlementData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settlements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-200 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold">Settlements</h1>
                    </div>

                    <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                        <MonthSelector
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>

                {/* Current Month Summary */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Month Summary</h2>
                        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">{settlementData?.period}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-teal-50 p-4 rounded-lg">
                            <p className="text-sm text-teal-700 font-medium">Total Expenses</p>
                            <p className="text-2xl font-bold text-teal-900">{settlementData?.totalExpenses} SAR</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-700 font-medium">Fair Share</p>
                            <p className="text-2xl font-bold text-blue-900">{settlementData?.fairShare} SAR</p>
                        </div>
                    </div>

                    {/* Individual Balances */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">Member Balances</h3>
                        <div className="space-y-2">
                            {settlementData?.balances?.map((balance, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="font-medium">{balance.userName}</span>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Paid: {balance.paid} SAR</p>
                                        <p className={`font-semibold ${balance.balance > 0 ? 'text-green-600' : balance.balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                            {balance.balance > 0 ? '+' : ''}{balance.balance} SAR
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settlement Recommendations */}
                    <div>
                        <h3 className="font-semibold mb-3">Settlement Recommendations</h3>
                        {settlementData?.settlements?.length > 0 ? (
                            <div className="space-y-3">
                                {settlementData.settlements.map((settlement, index) => (
                                    <div key={index} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-2">
                                                    {settlement.from_user_name} → {settlement.to_user_name}
                                                </p>

                                                {/* Breakdown */}
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between text-gray-700">
                                                        <span>Regular Mess:</span>
                                                        <span className="font-medium">{settlement.regularAmount} SAR</span>
                                                    </div>
                                                    <div className="flex justify-between text-gray-700">
                                                        <span>Guest Amount:</span>
                                                        <span className="font-medium">{settlement.guestAmount} SAR</span>
                                                    </div>
                                                    {settlement.sharedAmount > 0 && (
                                                        <div className="flex justify-between text-gray-700">
                                                            <span>Shared Expenses:</span>
                                                            <span className="font-medium">{settlement.sharedAmount} SAR</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-orange-200">
                                                        <span>Total:</span>
                                                        <span>{settlement.amount} SAR</span>
                                                    </div>

                                                    {settlement.breakdown && (
                                                        <details className="mt-3 text-xs text-gray-600 bg-white/50 p-2 rounded border border-orange-200">
                                                            <summary className="cursor-pointer font-medium text-orange-800 hover:text-orange-900 select-none">Show Calculation Logic</summary>
                                                            <div className="mt-2 space-y-2">
                                                                <div>
                                                                    <p className="font-semibold text-gray-700">{settlement.from_user_name} owes {settlement.to_user_name}:</p>
                                                                    <div className="pl-2 border-l-2 border-orange-300">
                                                                        <div className="flex justify-between">
                                                                            <span>Regular:</span>
                                                                            <span>{parseFloat(settlement.breakdown.forward.regular).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Guest:</span>
                                                                            <span>{parseFloat(settlement.breakdown.forward.guest).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Shared:</span>
                                                                            <span>{parseFloat(settlement.breakdown.forward.shared || 0).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between font-medium border-t border-orange-100 mt-1">
                                                                            <span>Subtotal:</span>
                                                                            <span>{parseFloat(settlement.breakdown.forward.total).toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold text-gray-700">{settlement.to_user_name} owes {settlement.from_user_name}:</p>
                                                                    <div className="pl-2 border-l-2 border-orange-300">
                                                                        <div className="flex justify-between">
                                                                            <span>Regular:</span>
                                                                            <span>{parseFloat(settlement.breakdown.reverse.regular || 0).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Guest:</span>
                                                                            <span>{parseFloat(settlement.breakdown.reverse.guest || 0).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Shared:</span>
                                                                            <span>{parseFloat(settlement.breakdown.reverse.shared || 0).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between font-medium border-t border-orange-100 mt-1">
                                                                            <span>Subtotal:</span>
                                                                            <span>{parseFloat(settlement.breakdown.reverse.total || 0).toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="pt-1 border-t border-orange-200 font-bold text-orange-900 text-right">
                                                                    Net: {settlement.amount} SAR
                                                                </div>
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <button
                                                    onClick={() => handleSaveSettlement(settlement)}
                                                    className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                                                >
                                                    Save Settlement
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-green-50 rounded-lg">
                                <svg className="w-16 h-16 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-800 font-semibold">All Settled!</p>
                                <p className="text-green-600 text-sm">Everyone has paid their fair share</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Saved Settlements */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Settlement History</h2>
                    {savedSettlements.length > 0 ? (
                        <div className="space-y-3">
                            {savedSettlements.map((settlement) => (
                                <div key={settlement.id} className={`p-4 rounded border-l-4 ${settlement.status === 'paid' ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
                                    }`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">
                                                {settlement.from_user_name} → {settlement.to_user_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(settlement.createdAt).toLocaleDateString()} • {settlement.settlement_period}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold">{settlement.amount} SAR</p>
                                            {settlement.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleMarkAsPaid(settlement.id)}
                                                    className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                >
                                                    Mark as Paid
                                                </button>
                                            ) : (
                                                <span className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded">
                                                    ✓ Paid
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No settlement history yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettlementsPage;
