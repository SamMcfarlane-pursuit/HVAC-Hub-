import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Eager load - critical path
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';

// Lazy load - secondary routes
const SmartTriage = lazy(() => import('./components/SmartTriage').then(m => ({ default: m.SmartTriage })));
const JobMap = lazy(() => import('./components/JobMap').then(m => ({ default: m.JobMap })));
const SupplyChain = lazy(() => import('./components/SupplyChain').then(m => ({ default: m.SupplyChain })));
const AssetSharing = lazy(() => import('./components/AssetSharing').then(m => ({ default: m.AssetSharing })));
const MarketIntelligence = lazy(() => import('./components/MarketIntelligence').then(m => ({ default: m.MarketIntelligence })));

// Loading fallback component
const PageLoader = () => (
  <div className="h-full flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
      <span className="text-slate-400 text-sm font-medium">Loading module...</span>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/market" element={<MarketIntelligence />} />
                <Route path="/triage" element={<SmartTriage />} />
                <Route path="/routing" element={<JobMap />} />
                <Route path="/supply" element={<SupplyChain />} />
                <Route path="/assets" element={<AssetSharing />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;
