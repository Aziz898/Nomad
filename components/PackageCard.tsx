import React from 'react';
import { TourPackage } from '../types';
import { Plane, Star, Clock } from 'lucide-react';

interface Props {
  pkg: TourPackage;
  onClick: () => void;
}

const PackageCard: React.FC<Props> = ({ pkg, onClick }) => {
  const badgeColors = {
    economy: 'bg-green-100 text-green-700',
    optimal: 'bg-brand-100 text-brand-700',
    premium: 'bg-purple-100 text-purple-700'
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={pkg.coverImage} 
          alt={pkg.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeColors[pkg.type]}`}>
          {pkg.type}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
          {pkg.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
          {pkg.description}
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
             <Plane size={16} className="text-gray-400" />
             <span>{pkg.flight.outbound.airline} • {pkg.flight.outbound.duration}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
             <Star size={16} className="text-yellow-400 fill-yellow-400" />
             <span>{pkg.hotel.name} ({pkg.hotel.stars}★)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div>
            <span className="block text-xs text-gray-400">Total Price</span>
            <span className="text-xl font-bold text-gray-900">${pkg.totalPrice}</span>
          </div>
          <button className="px-4 py-2 bg-gray-50 group-hover:bg-brand-500 group-hover:text-white text-gray-700 rounded-lg text-sm font-medium transition-colors">
            View Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
