
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SmartTriage } from './components/SmartTriage';
import { JobMap } from './components/JobMap';
import { SupplyChain } from './components/SupplyChain';
import { AssetSharing } from './components/AssetSharing';
import { MarketIntelligence } from './components/MarketIntelligence';

import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/market" element={<MarketIntelligence />} />
              <Route path="/triage" element={<SmartTriage />} />
              <Route path="/routing" element={<JobMap />} />
              <Route path="/supply" element={<SupplyChain />} />
              <Route path="/assets" element={<AssetSharing />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;
