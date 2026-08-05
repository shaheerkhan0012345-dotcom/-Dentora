import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { TeamSection } from './components/TeamSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { AboutUsSection } from './components/AboutUsSection';
import { BookingSection } from './components/BookingSection';
import { FooterSection } from './components/FooterSection';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserProfile } from './types';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { PWAInstaller } from './components/pwa/PWAInstaller';

function MainContent() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'dashboard'>('home');

  // Convert AppUser from Firebase Context to UserProfile format if signed in
  const user: UserProfile | null = currentUser ? {
    id: currentUser.uid,
    name: currentUser.displayName,
    email: currentUser.email,
    phone: currentUser.phone || '',
    avatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    memberSince: currentUser.memberSince || 'August 2026',
    plan: currentUser.plan || `${currentUser.role} Portal Access`,
    assignedOrthodontist: currentUser.assignedOrthodontist || 'Dr. Elena Rostova, MD',
  } : null;

  const handleOpenDashboard = () => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoginSuccess = (_loggedInUser: UserProfile) => {
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout warning:', e);
    }
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookVisitFromDashboard = () => {
    setCurrentPage('home');
    setTimeout(() => {
      const bookingElem = document.getElementById('booking');
      if (bookingElem) {
        bookingElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // FULL STANDALONE AUTHENTICATION PAGE
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <OfflineBanner />
        <AuthPage
          onNavigateHome={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLoginSuccess={handleLoginSuccess}
        />
        <PWAInstaller />
      </div>
    );
  }

  // FULL STANDALONE PROTECTED DASHBOARD PAGE
  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <OfflineBanner />
        <ProtectedRoute onUnauthenticated={() => setCurrentPage('login')}>
          {user ? (
            <DashboardPage
              user={user}
              onNavigateHome={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLogout={handleLogout}
              onBookNewVisit={handleBookVisitFromDashboard}
            />
          ) : (
            <AuthPage
              onNavigateHome={() => setCurrentPage('home')}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </ProtectedRoute>
        <PWAInstaller />
      </div>
    );
  }

  // MAIN LANDING PAGE
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <OfflineBanner />
      <HeroSection 
        user={user} 
        onOpenDashboard={handleOpenDashboard} 
      />
      <ServicesSection />
      <WhyChooseUsSection />
      <TeamSection />
      <TestimonialsSection />
      <AboutUsSection />
      <BookingSection />
      <FooterSection />
      <PWAInstaller />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ClinicProvider>
          <MainContent />
        </ClinicProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

