import { useExpense } from '../context/ExpenseContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const ContributorChart = () => {
    const { dashboardData } = useExpense();
    const contributors = dashboardData?.contributors || [];

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>

            {contributors.length > 0 ? (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value, entry) => `${value}: ${entry.payload.value} SAR`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="text-gray-500 text-center py-8">No contributors yet</p>
            )}
        </div>
    );
};

export default ContributorChart;
