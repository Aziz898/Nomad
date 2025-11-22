import React, { useState } from 'react';
import { TourPackage, Activity } from '../types';
import { X, Plane, BedDouble, MapPin, Ticket, ShieldCheck, Check, Info, Star, Clock } from 'lucide-react';

interface Props {
  pkg: TourPackage;
  onClose: () => void;
}

const TripDetails: React.FC<Props> = ({ pkg, onClose }) => {
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel' | 'activities' | 'visa'>('flight');
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(
    new Set(pkg.activities.filter(a => a.included).map(a => a.id))
  );

  const toggleActivity = (id: string) => {
    const newSet = new Set(selectedActivities);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedActivities(newSet);
  };

  const calculateTotal = () => {
    let total = pkg.totalPrice;
    // Adjust total based on activity toggles (simplified logic as base price usually includes 'included' ones)
    // For MVP, lets just say total is fixed base + extra activities
    // But to keep it simple, we will just display the static price for now or a simple recalculation
    return total;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left: Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{pkg.title}</h2>
              <p className="text-sm text-gray-500">Provided by NomadTrip AI</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full md:hidden">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'flight', icon: Plane, label: 'Flights' },
              { id: 'hotel', icon: BedDouble, label: 'Hotel' },
              { id: 'activities', icon: Ticket, label: 'Activities' },
              { id: 'visa', icon: ShieldCheck, label: 'Visa Info' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {activeTab === 'flight' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase text-gray-400">Outbound</span>
                    <span className="text-sm font-medium text-gray-900">{pkg.flight.outbound.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{pkg.flight.outbound.departureTime}</div>
                      <div className="text-sm text-gray-500">Departure</div>
                    </div>
                    <div className="flex-1 px-8 flex flex-col items-center">
                       <div className="w-full h-[1px] bg-gray-300 relative">
                         <Plane size={16} className="absolute -top-2 left-1/2 -translate-x-1/2 text-gray-400" />
                       </div>
                       <span className="text-xs text-brand-600 font-medium mt-2">{pkg.flight.outbound.airline}</span>
                       <span className="text-xs text-gray-400">{pkg.flight.outbound.flightNumber}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{pkg.flight.outbound.arrivalTime}</div>
                      <div className="text-sm text-gray-500">Arrival</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase text-gray-400">Return</span>
                    <span className="text-sm font-medium text-gray-900">{pkg.flight.return.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{pkg.flight.return.departureTime}</div>
                      <div className="text-sm text-gray-500">Departure</div>
                    </div>
                    <div className="flex-1 px-8 flex flex-col items-center">
                       <div className="w-full h-[1px] bg-gray-300 relative">
                         <Plane size={16} className="absolute -top-2 left-1/2 -translate-x-1/2 text-gray-400 rotate-180" />
                       </div>
                       <span className="text-xs text-brand-600 font-medium mt-2">{pkg.flight.return.airline}</span>
                       <span className="text-xs text-gray-400">{pkg.flight.return.flightNumber}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{pkg.flight.return.arrivalTime}</div>
                      <div className="text-sm text-gray-500">Arrival</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hotel' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-64 relative">
                  <img src={pkg.hotel.imageUrl} className="w-full h-full object-cover" alt="Hotel" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" /> {pkg.hotel.rating} Excellent
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{pkg.hotel.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin size={16} /> {pkg.hotel.address}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">{pkg.hotel.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <span className="block text-xs text-gray-400 uppercase">Check-in</span>
                      <span className="font-semibold">After 14:00</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <span className="block text-xs text-gray-400 uppercase">Per Night</span>
                      <span className="font-semibold">${pkg.hotel.pricePerNight}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-4">
                {pkg.activities.map(activity => (
                  <div key={activity.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 items-start shadow-sm">
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        checked={selectedActivities.has(activity.id)}
                        onChange={() => toggleActivity(activity.id)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                        <span className="text-sm font-bold">${activity.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <Clock size={12} /> {activity.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'visa' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                   ${pkg.visa.status === 'Not Required' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-xl font-bold mb-2">{pkg.visa.status}</h3>
                 <p className="text-gray-600 mb-6">{pkg.visa.description}</p>
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm text-left flex gap-3">
                   <Info size={20} className="flex-shrink-0 mt-0.5" />
                   <p>NomadTrip AI can assist with document preparation if a visa is required. Select "Request Booking" to proceed.</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar / Cart */}
        <div className="w-full md:w-80 bg-white border-l border-gray-100 p-6 flex flex-col h-auto md:h-full relative shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full hidden md:block">
              <X size={20} className="text-gray-400" />
            </button>

            <h3 className="text-lg font-bold mb-6 mt-2">Summary</h3>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Flights (Round trip)</span>
                <span className="font-medium">${pkg.flight.outbound.price + pkg.flight.return.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hotel ({pkg.hotel.stars}★)</span>
                <span className="font-medium">${pkg.hotel.totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Activities ({selectedActivities.size})</span>
                <span className="font-medium text-brand-600">Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes & Fees</span>
                <span className="font-medium">$120</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <div className="flex justify-between items-end mb-6">
                 <div>
                   <span className="block text-xs text-gray-400 mb-1">Total for 1 person</span>
                   <span className="text-3xl font-bold text-gray-900">${calculateTotal()}</span>
                 </div>
              </div>

              <button className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 transition-all mb-3">
                Request Booking
              </button>
              <button className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all">
                Save for Later
              </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TripDetails;