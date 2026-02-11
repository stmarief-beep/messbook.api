import React from 'react';

const MonthSelector = ({ selectedMonth, selectedYear, onChange }) => {
    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    return (
        <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <select
                value={selectedMonth}
                onChange={(e) => onChange(parseInt(e.target.value), selectedYear)}
                className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
                {months.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>
            <span className="text-gray-300">|</span>
            <select
                value={selectedYear}
                onChange={(e) => onChange(selectedMonth, parseInt(e.target.value))}
                className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
                {years.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MonthSelector;
