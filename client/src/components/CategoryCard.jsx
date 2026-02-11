import { useExpense } from '../context/ExpenseContext';

const CategoryCard = () => {
    const { dashboardData } = useExpense();
    const categories = dashboardData?.categories || [];

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>

            <div className="space-y-4">
                {categories.map((cat, index) => {
                    const colors = getCategoryColor(cat.category);
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Circular progress */}
                                <div className="relative w-12 h-12">
                                    <svg className="transform -rotate-90 w-12 h-12">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="#e5e7eb"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${(parseFloat(cat.percentage) / 100) * 125.6} 125.6`}
                                            className={colors.text}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-xs font-bold ${colors.text}`}>
                                            {cat.percentage}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-medium">{cat.category}</p>
                                    <p className="text-sm text-gray-500">{cat.amount} SAR</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {categories.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No expenses yet</p>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;
