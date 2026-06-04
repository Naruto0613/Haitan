/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Reader from './pages/Reader';
import About from './pages/About';
import Admin from './pages/Admin';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';
import { ComicsProvider } from './contexts/ComicsContext';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ComicsProvider>
        <AdminProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/library" element={<Layout><Library /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/admin" element={<Layout><Admin /></Layout>} />
              {/* Reader is full screen, optional layout */}
              <Route path="/reader/:comicId/:chapterId" element={<Reader />} />
            </Routes>
          </Router>
        </AdminProvider>
      </ComicsProvider>
    </AuthProvider>
  );
}
