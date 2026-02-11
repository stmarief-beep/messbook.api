import React from 'react';

const MemberReportCard = ({ report }) => {
    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const CategorySection = ({ title, data }) => (
        <div className="bg-gray-50 rounded p-3">
            <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1 text-sm">{title}</h3>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Actual Share</span>
                    <span className="font-medium text-gray-800">{data.actual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Paid (Spent)</span>
                    <span className="font-medium text-gray-800">{data.spent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 mt-1 pt-1">
                    <span className="text-gray-600 font-medium">Balance</span>
                    <span className={`font-bold ${getBalanceColor(data.balance)}`}>
                        {data.balance.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`bg-white rounded-lg shadow-sm overflow-hidden border ${report.isGuest ? 'border-orange-200' : 'border-gray-100'}`}>
            {/* Member Header */}
            <div className={`p-4 border-b flex items-center justify-between ${report.isGuest ? 'bg-orange-50' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${report.isGuest ? 'bg-orange-100 text-orange-600' : 'bg-teal-50 text-teal-600'}`}>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-bold text-lg text-gray-800 block leading-tight">{report.userName}</span>
                        {report.isGuest && <span className="text-xs text-orange-600 font-medium mt-0.5 block">Guest Account</span>}
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Balance</span>
                    <div className={`text-xl font-bold ${getBalanceColor(report.overallBalance)}`}>
                        {report.overallBalance > 0 ? '+' : ''}{report.overallBalance.toFixed(2)} <span className="text-xs font-normal text-gray-400">SAR</span>
                    </div>
                </div>
            </div>

            {/* Expense Categories Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CategorySection title="Regular" data={report.regular} />
                <CategorySection title="Guest" data={report.guest} />
                <CategorySection title="Shared" data={report.shared} />
            </div>
        </div>
    );
};

export default MemberReportCard;
