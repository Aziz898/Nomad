
import React, { useState } from 'react';
import StepWizard from './components/StepWizard';
import { TripBuilder } from './components/TripBuilder';
import { TripSummary } from './components/TripSummary';
import { AuthModal } from './components/AuthModal';
import { AccountDashboard } from './components/AccountDashboard';
import { UserPreferences, TripOptions, TripSelection, User, Booking } from './types';
import { generateTripOptions } from './services/geminiService';
import { Map, User as UserIcon } from 'lucide-react';
import { ShaderAnimation } from './components/ShaderAnimation';

const App: React.FC = () => {
  // App State Machine
  const [view, setView] = useState<'wizard' | 'builder' | 'summary' | 'dashboard'>('wizard');
  const [loading, setLoading] = useState(false);
  
  // User & Auth
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Trip Data
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [tripOptions, setTripOptions] = useState<TripOptions | null>(null);
  const [finalSelection, setFinalSelection] = useState<TripSelection | null>(null);

  const handleWizardComplete = async (userPrefs: UserPreferences) => {
    setPrefs(userPrefs);
    setLoading(true);
    try {
      const options = await generateTripOptions(userPrefs);
      setTripOptions(options);
      setView('builder');
    } catch (error) {
      alert("Failed to generate trip options. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuilderComplete = (selection: TripSelection) => {
    setFinalSelection(selection);
    setView('summary');
  };

  // Triggered by "Proceed to Booking"
  const handleBookingRequest = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      createBooking(user);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
    // If we were at summary, auto-book
    if (view === 'summary' && finalSelection) {
      createBooking(loggedInUser);
    }
  };

  const createBooking = (currentUser: User) => {
    if (!finalSelection || !prefs) return;

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      destination: prefs.destination,
      dateRange: `${prefs.dates} (${prefs.duration} days)`,
      totalCost: (finalSelection.selectedFlight?.price || 0) + 
                 (finalSelection.selectedHotel?.totalPrice || 0) + 
                 finalSelection.selectedActivities.reduce((sum, a) => sum + a.price, 0),
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      image: finalSelection.selectedHotel?.imageUrl || '',
      details: finalSelection
    };

    setBookings(prev => [newBooking, ...prev]);
    setView('dashboard');
  };

  return (
    <div className="h-screen font-sans text-gray-900 overflow-hidden flex flex-col relative">
      
      <ShaderAnimation />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} />

      {/* Header */}
      <header className="bg-white/60 backdrop-blur-md border-b border-white/20 h-16 flex-none z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('wizard')}>
            <div className="bg-brand-500 p-1.5 rounded-lg text-white shadow-lg shadow-brand-200/50">
               <Map size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">NomadTrip<span className="text-brand-500">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {prefs && view !== 'wizard' && view !== 'dashboard' && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</span>
                <span className="text-sm font-semibold text-gray-900">{prefs.destination}</span>
              </div>
            )}
            
            {user ? (
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-full pr-3 transition-colors"
                onClick={() => setView('dashboard')}
              >
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                <span className="text-sm font-bold text-gray-700 hidden sm:inline">{user.name}</span>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="text-sm font-bold text-brand-600 hover:text-brand-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative w-full overflow-hidden z-10">
        
        {/* 1. WIZARD */}
        {view === 'wizard' && (
          <div className="h-full w-full flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            <StepWizard onComplete={handleWizardComplete} isLoading={loading} />
          </div>
        )}

        {/* 2. BUILDER (Flights -> Hotels -> Activities) */}
        {view === 'builder' && tripOptions && (
          <div className="h-full w-full p-4 lg:p-6 animate-in fade-in zoom-in-95 duration-500">
            <TripBuilder options={tripOptions} onComplete={handleBuilderComplete} />
          </div>
        )}

        {/* 3. SUMMARY & CHAT */}
        {view === 'summary' && finalSelection && prefs && (
          <div className="h-full w-full animate-in slide-in-from-bottom-10 duration-500">
            <TripSummary 
              selection={finalSelection} 
              prefs={prefs} 
              onRestart={() => setView('wizard')}
              onBook={handleBookingRequest}
            />
          </div>
        )}

        {/* 4. DASHBOARD */}
        {view === 'dashboard' && user && (
          <div className="h-full w-full animate-in fade-in duration-500">
            <AccountDashboard 
              user={user} 
              bookings={bookings} 
              onLogout={() => { setUser(null); setView('wizard'); }}
              onNewTrip={() => setView('wizard')}
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
