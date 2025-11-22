import React from 'react';
import { Booking, User } from '../types';
import { Calendar, MapPin, DollarSign, CheckCircle, Clock, ArrowRight, LogOut } from 'lucide-react';
import { ImageWithSkeleton } from './ui/ImageWithSkeleton';

interface Props {
  user: User;
  bookings: Booking[];
  onLogout: () => void;
  onNewTrip: () => void;
}

export const AccountDashboard: React.FC<Props> = ({ user, bookings, onLogout, onNewTrip }) => {
  return (
    <div className="h-full w-full max-w-7xl mx-auto p-4 lg:p-8 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hello, {user.name}!</h1>
            <p className="text-gray-500 text-sm">Member since 2025</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onNewTrip}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-200 transition-all flex items-center gap-2"
          >
            <ArrowRight size={18} /> Plan New Trip
          </button>
          <button 
            onClick={onLogout}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
            title="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Trips</div>
          <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Upcoming</div>
          <div className="text-3xl font-bold text-brand-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Countries</div>
          <div className="text-3xl font-bold text-purple-600">
            {new Set(bookings.map(b => b.destination)).size}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Your Journeys</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No trips booked yet</h3>
          <p className="text-gray-500 mb-6">Start your adventure with NomadTrip AI today.</p>
          <button onClick={onNewTrip} className="text-brand-600 font-bold hover:underline">Start Searching</button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-all">
              <div className="md:w-64 h-48 md:h-auto relative">
                <ImageWithSkeleton 
                  src={booking.image} 
                  alt={booking.destination} 
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.destination}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} /> {booking.dateRange}
                    </p>
                  </div>
                  <div className="text-right">
                     <div className="text-lg font-bold text-gray-900">${booking.totalCost}</div>
                     <div className="text-xs text-gray-400">Total Paid</div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                   <div className="flex gap-4 text-gray-600">
                      <span className="flex items-center gap-1"><Clock size={14} /> 7 Days</span>
                      <span className="flex items-center gap-1"><CheckCircle size={14} className="text-brand-500" /> All Booked</span>
                   </div>
                   <button className="text-brand-600 font-bold hover:text-brand-700">View Itinerary</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
