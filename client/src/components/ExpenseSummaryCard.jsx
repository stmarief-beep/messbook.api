import { useExpense } from '../context/ExpenseContext';

const ExpenseSummaryCard = () => {
    const { dashboardData } = useExpense();
    const summary = dashboardData?.summary;

    if (!summary) return null;

    return (
        <div className="relative overflow-hidden rounded-lg p-6 text-white" style={{
            background: 'linear-gradient(135deg, #2d5f5d 0%, #1a3a38 100%)'
        }}>
            {/* Decorative circles */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-8 translate-y-8"></div>

            {/* Icon */}
            <div className="absolute top-4 right-4">
                <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
            </div>

            <div className="relative z-10">
                <p className="text-sm opacity-90 mb-1">Total Expenses</p>
                <h2 className="text-4xl font-bold mb-4">{summary.total} SAR</h2>

                <div className="flex justify-between items-center text-sm">
                    <div>
                        <p className="opacity-75">Settlement Cycle</p>
                        <p className="font-semibold">{summary.period}</p>
                    </div>
                    <div className="text-right">
                        <p className="opacity-75">Created On</p>
                        <p className="font-semibold">{new Date().toLocaleDateString('en-GB').replace(/\//g, '/')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSummaryCard;
