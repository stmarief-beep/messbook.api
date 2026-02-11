import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const ContributorChart = () => {
    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContributors();
    }, []);

    const fetchContributors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/expenses/contributors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContributors(res.data);
        } catch (error) {
            console.error('Failed to fetch contributors', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const chartData = contributors.map((c, index) => ({
        name: c.name,
        value: parseFloat(c.amount),
        color: COLORS[index % COLORS.length]
    }));

    if (loading) return <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>;

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
