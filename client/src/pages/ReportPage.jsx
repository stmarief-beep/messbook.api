import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MemberReportCard from '../components/MemberReportCard';
import MonthSelector from '../components/MonthSelector';
import { generateReportPDF } from '../utils/pdfGenerator';

const ReportPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [period, setPeriod] = useState('');

    // Default to current month/year
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchReports();
    }, [selectedMonth, selectedYear]);

    const fetchReports = async () => {
        try {
            // Only set full loading on initial load or if you want a spinner on every change
            // setLoading(true); 
            const token = localStorage.getItem('token');
            const res = await axios.get('/reports/members', {
                headers: { Authorization: `Bearer ${token}` },
                params: { month: selectedMonth, year: selectedYear }
            });
            setReports(res.data.reports);
            setPeriod(res.data.period);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const handleDownloadPDF = () => {
        if (reports.length > 0) {
            generateReportPDF(reports, period);
        }
    };

    if (loading && !reports.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-teal-700 text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-teal-600 rounded-lg text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Report</h1>
                            <p className="text-sm text-teal-100 opacity-90">{period}</p>
                        </div>
                    </div>

                    <div className="text-gray-800 w-full sm:w-auto flex gap-2 justify-center sm:justify-end">
                        <MonthSelector
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            onChange={handleDateChange}
                        />
                        <button
                            onClick={handleDownloadPDF}
                            className="px-4 py-2 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-colors font-medium flex items-center gap-2 shadow-sm"
                            disabled={reports.length === 0}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Member Reports */}
            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {reports.length > 0 ? (
                    reports.map((report) => (
                        <MemberReportCard key={report.userId} report={report} />
                    ))
                ) : (
                    <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No reports available for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportPage;
