import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { BooksPage } from './pages/BooksPage';
import { MembersPage } from './pages/MembersPage';
import { CirculationPage } from './pages/CirculationPage';
import { FinesPage } from './pages/FinesPage';
import { MyBorrowsPage } from './pages/MyBorrowsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import api from './api/axios';

export const App = () => {
  const { user, isAuthenticated, loading, isMember, canManageBooks } = useAuth();

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [overdueCount, setOverdueCount] = useState(0);
  const [pendingFinesCount, setPendingFinesCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Synchronize default tab on role changes
  useEffect(() => {
    if (isAuthenticated) {
      if (isMember) {
        setActiveTab('books');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [isAuthenticated, isMember]);

  const fetchNotificationBadges = async () => {
    if (!isAuthenticated) return;
    try {
      setIsRefreshing(true);
      if (canManageBooks) {
        const [overdueRes, finesRes] = await Promise.all([
          api.get('/borrow/overdue'),
          api.get('/fines', { params: { status: 'PENDING' } }),
        ]);
        setOverdueCount(overdueRes.data.data?.length || 0);
        setPendingFinesCount(finesRes.data.data?.length || 0);
      } else if (isMember && user?.id) {
        const myFinesRes = await api.get(`/fines/member/${user.id}`);
        const unpaid = (myFinesRes.data.data || []).filter((f) => f.status === 'PENDING').length;
        setPendingFinesCount(unpaid);
      }
    } catch (err) {
      console.error('Error refreshing badges:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotificationBadges();
  }, [isAuthenticated, activeTab, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Initializing Athena Library System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const getPageMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Collection metrics & circulation health' };
      case 'books':
        return { title: 'Book Catalog & Inventory', subtitle: 'Search, filter, and manage titles' };
      case 'members':
        return { title: 'Member Directory', subtitle: 'Registered patrons, students, and staff accounts' };
      case 'circulation':
        return { title: 'Circulation Desk', subtitle: 'Issue books, process returns, and handle renewals' };
      case 'fines':
        return { title: isMember ? 'My Library Fines' : 'Fine Management & Settlements', subtitle: 'Late returns penalty ledger & payment history' };
      case 'my-borrows':
        return { title: 'My Borrowed Books', subtitle: 'Active loans and reading history' };
      default:
        return { title: 'Library Management', subtitle: '' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreturnedOverdueCount={overdueCount}
        pendingFinesCount={pendingFinesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={meta.title}
          subtitle={meta.subtitle}
          onRefresh={fetchNotificationBadges}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'books' && <BooksPage />}
          {activeTab === 'members' && <MembersPage />}
          {activeTab === 'circulation' && <CirculationPage />}
          {activeTab === 'fines' && <FinesPage />}
          {activeTab === 'my-borrows' && <MyBorrowsPage />}
        </main>
      </div>
    </div>
  );
};
