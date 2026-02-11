import { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryCard = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/expenses/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Mess': { bg: 'bg-yellow-400', text: 'text-yellow-600' },
            'General': { bg: 'bg-blue-400', text: 'text-blue-600' },
            'Utilities': { bg: 'bg-green-400', text: 'text-green-600' }
        };
        return colors[category] || { bg: 'bg-gray-400', text: 'text-gray-600' };
    };

    if (loading) return <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>;

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
