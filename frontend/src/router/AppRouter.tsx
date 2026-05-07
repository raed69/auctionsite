import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import HomePage from '../pages/HomePage';
import AuctionDetailPage from '../pages/AuctionDetailPage/Index';
import CreateAuctionPage from '../pages/CreateAuctionPage';
import AuthLayout from '../pages/AuthPage/AuthLayout';
import SignUpPage from '../pages/AuthPage/SignUpPage';
import LoginPage from '../pages/AuthPage/LoginPage';
import NotificationsPage from '../pages/NotificationsPage';
import FavouritesPage from '../pages/FavouritesPage';
import ProtectedRoute from './ProtectedRoute';

// ─── Stub pages ───────────────────────────────────────────────────────────────
const ProfilePage = () => (
  <main className="p-8">
    <p className="font-headline text-2xl font-bold">[ProfilePage] — coming soon.</p>
  </main>
);
 
const NotFoundPage = () => (
  <main className="flex items-center justify-center min-h-screen p-8">
    <div className="text-center">
      <h1 className="font-headline text-8xl font-black text-outline/30 mb-4">404</h1>
      <p className="font-headline text-2xl font-bold mb-2">Page not found.</p>
      <a href="/" className="text-primary font-bold font-body border-b border-primary">
        Back to auctions
      </a>
    </div>
  </main>
);
// ─────────────────────────────────────────────────────────────────────────────
 
// Navbar + fixed Sidebar — page content must have lg:ml-64
function SidebarLayout() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex flex-1">
        <Sidebar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
 
// Navbar only, no sidebar
function FullWidthLayout() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
 
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
 
        {/* ── With sidebar ── */}
        <Route element={<SidebarLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>
 
        {/* ── Full width ── */}
        <Route element={<FullWidthLayout />}>
          {/* static before dynamic — prevents /auctions/create matching as :id="create" */}
          <Route path="auctions/create" element={<ProtectedRoute><CreateAuctionPage /></ProtectedRoute>} />
          <Route path="auctions/:id" element={<AuctionDetailPage />} />
          <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
        </Route>
 
        {/* ── Auth — own minimal layout ── */}
        <Route path="auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>
 
        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
 
      </Routes>
    </BrowserRouter>
  );
}

// http://localhost:5173
// http://localhost:5173/notifications
// http://localhost:5173/favourites
// http://localhost:5173/auth/signup
// http://localhost:5173/auth/login
// http://localhost:5173/auctions/1
// http://localhost:5173/auctions/create