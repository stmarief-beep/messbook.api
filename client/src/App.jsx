import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MessProvider } from './context/MessContext';
import { ExpenseProvider } from './context/ExpenseContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SettlementsPage from './pages/SettlementsPage';
import ReportPage from './pages/ReportPage';
import ProfilePage from './pages/ProfilePage';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <MessProvider>
                <ExpenseProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/settlements"
                                element={
                                    <PrivateRoute>
                                        <SettlementsPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/report"
                                element={
                                    <PrivateRoute>
                                        <ReportPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <PrivateRoute>
                                        <ProfilePage />
                                    </PrivateRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                        <PWAInstallPrompt />
                    </Router>
                </ExpenseProvider>
            </MessProvider>
        </AuthProvider>
    );
}

export default App;
