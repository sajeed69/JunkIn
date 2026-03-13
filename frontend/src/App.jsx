import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import CreateListing from './pages/CreateListing';
import AIAnalysis from './pages/AIAnalysis';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import ScrapSchedule from './pages/ScrapSchedule';
import KabadiwalaDashboard from './pages/KabadiwalaDashboard';
import KabadiwalaProfile from './pages/KabadiwalaProfile';
import RecyclerDashboard from './pages/RecyclerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestlyApiClient from './pages/RequestlyApiClient';


function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <ErrorBoundary>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                style: {
                                    fontFamily: 'Inter, sans-serif',
                                    borderRadius: '0.75rem',
                                    background: '#1e293b',
                                    color: '#f8fafc',
                                },
                                success: { iconTheme: { primary: '#2ecc70', secondary: '#fff' } },
                            }}
                        />
                        <Routes>
                            {/* Public */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/marketplace" element={<Marketplace />} />
                            <Route path="/listing/:id" element={<ListingDetail />} />

                            {/* Protected - any authenticated user */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={<UserDashboard />} />
                                <Route path="/profile" element={<UserProfile />} />
                                <Route path="/create-listing" element={<CreateListing />} />
                                <Route path="/ai-analysis" element={<AIAnalysis />} />
                                <Route path="/scrap-schedule" element={<ScrapSchedule />} />
                            </Route>

                            {/* Kabadiwala only */}
                            <Route element={<RoleRoute allowedRoles={['kabadiwala']} />}>
                                <Route path="/kabadiwala" element={<KabadiwalaDashboard />} />
                                <Route path="/kabadiwala/profile" element={<KabadiwalaProfile />} />
                            </Route>

                            {/* Recycler only */}
                            <Route element={<RoleRoute allowedRoles={['recycler']} />}>
                                <Route path="/recycler" element={<RecyclerDashboard />} />
                            </Route>

                            {/* Admin only */}
                            <Route element={<RoleRoute allowedRoles={['admin']} />}>
                                <Route path="/admin" element={<AdminDashboard />} />
                            </Route>

                            {/* Tools */}
                            <Route path="/requestly-client" element={<RequestlyApiClient />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ErrorBoundary>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
