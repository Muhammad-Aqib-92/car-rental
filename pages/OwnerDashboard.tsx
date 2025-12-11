import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Car, BookingWithCar } from '../types';
import { Plus, Trash2, Calendar, CheckCircle, XCircle, Wand2, Loader2, Pencil, CarFront, DollarSign, X, Check, Video, Upload, Play, ExternalLink, Sparkles, Settings2, User, Mail, MapPin, Clock, BarChart3, TrendingUp, Star } from 'lucide-react';
import { generateCarDescription, generateVeoVideo, generateVideoScript } from '../services/geminiService';

export const OwnerDashboard = () => {
  const { user, cars, deleteCar, bookings, updateBookingStatus, addCar, updateCar, getOwnerById } = useApp();
  const [activeTab, setActiveTab] = useState<'inventory' | 'bookings' | 'analytics'>('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  
  // State for Video Promotion features
  const [videoModalData, setVideoModalData] = useState<{file: File | null, prompt: string}>({ file: null, prompt: '' });
  const [promotingCarId, setPromotingCarId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCar(null);
    setIsModalOpen(true);
  };

  const openEditModal = (car: Car) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const openVideoModal = (file: File | null = null, prompt: string = '') => {
      setVideoModalData({ file, prompt });
      setIsVideoModalOpen(true);
  };

  const handleDelete = (carId: string) => {
    if (window.confirm('Are you sure you want to remove this vehicle from your fleet? This cannot be undone.')) {
      deleteCar(carId);
    }
  };

  const handlePromote = async (car: Car) => {
      setPromotingCarId(car.id);
      try {
          // 1. Fetch Image and convert to File
          let file = null;
          try {
              const res = await fetch(car.imageUrl);
              const blob = await res.blob();
              file = new File([blob], "car_image.png", { type: blob.type });
          } catch (e) {
              console.warn("Could not fetch image automatically (likely CORS). User will need to re-upload.", e);
          }

          // 2. Generate Script
          const script = await generateVideoScript(car.name, car.category);
          
          openVideoModal(file, script);
      } catch (e) {
          console.error("Promotion setup failed", e);
          alert("Could not prepare video generation. Please try manually.");
          openVideoModal();
      } finally {
          setPromotingCarId(null);
      }
  };

  const myCars = cars.filter(c => c.ownerId === user?.id);
  const myBookings: BookingWithCar[] = bookings
    .filter(b => b.ownerId === user?.id)
    .map(b => {
      const car = cars.find(c => c.id === b.carId);
      const client = getOwnerById(b.clientId);
      return {
        ...b,
        carName: car?.name || 'Unknown Car',
        carImage: car?.imageUrl || '',
        clientName: client?.name || 'Guest Client',
        clientEmail: client?.email || 'No email provided'
      };
    })
    .sort((a, b) => {
        // Sort by status (Pending first), then date
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const pendingCount = myBookings.filter(b => b.status === 'PENDING').length;

  // Analytics Calculation
  const totalRevenue = myBookings.filter(b => b.status === 'APPROVED').reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalTrips = myBookings.filter(b => b.status === 'APPROVED').length;
  const avgFleetRating = myCars.reduce((acc, c) => acc + (c.rating || 0), 0) / (myCars.filter(c => c.rating && c.rating > 0).length || 1);

  // Simple Monthly Revenue Data Mockup logic
  const revenueByMonth = myBookings
    .filter(b => b.status === 'APPROVED')
    .reduce((acc, b) => {
        const date = new Date(b.startDate);
        const key = date.toLocaleString('default', { month: 'short' });
        acc[key] = (acc[key] || 0) + b.totalPrice;
        return acc;
    }, {} as Record<string, number>);

  const chartData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({
      month: m,
      value: revenueByMonth[m] || 0
  }));
  const maxChartValue = Math.max(...chartData.map(d => d.value), 100);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Owner Dashboard</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage your fleet and revenue</p>
            </div>
            
            <div className="flex gap-3">
                <button
                    onClick={() => openVideoModal()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-md shadow-purple-200 hover:bg-purple-700 transition-all"
                >
                    <Video className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Video Ad</span>
                </button>

                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        activeTab === 'inventory' 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        Fleet ({myCars.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'bookings' 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        Requests
                        {pendingCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'analytics' 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        Analytics
                    </button>
                </div>
            </div>
        </div>

        {activeTab === 'inventory' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <button
                    onClick={openAddModal}
                    className="group flex flex-col items-center justify-center min-h-[300px] bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-[2rem] hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer"
                >
                    <div className="bg-white p-5 rounded-full mb-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        <Plus className="h-8 w-8 text-indigo-600" />
                    </div>
                    <span className="text-lg font-bold text-indigo-900">List New Car</span>
                    <span className="text-sm text-indigo-400 font-medium">Add to your fleet</span>
                </button>

                {myCars.map(car => (
                <div key={car.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                        <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                car.status === 'AVAILABLE' ? 'bg-green-500 text-white' : 'bg-slate-800 text-white'
                            }`}>
                                {car.status}
                            </span>
                        </div>
                        <div className="absolute bottom-3 left-4 text-white">
                            <h3 className="font-bold text-lg">{car.name}</h3>
                            <div className="flex items-center gap-2 text-xs font-medium opacity-80">
                                <span>{car.modelYear}</span> • 
                                {car.rating ? (
                                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-white" /> {car.rating}</span>
                                ) : (
                                    <span>New</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-slate-50 px-3 py-1.5 rounded-lg">
                                <span className="font-bold text-slate-900">${car.pricePerDay}</span>
                                <span className="text-xs text-slate-400 font-medium">/day</span>
                            </div>
                            <span className="text-xs text-slate-300 font-mono">ID: {car.id.slice(0,4)}</span>
                        </div>
                        
                        <div className="mt-auto space-y-3">
                            <button 
                                onClick={() => handlePromote(car)}
                                disabled={promotingCarId === car.id}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-50 text-purple-600 text-sm font-bold hover:bg-purple-100 transition-colors disabled:opacity-70 disabled:cursor-wait"
                            >
                                {promotingCarId === car.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" /> 
                                ) : (
                                    <Sparkles className="h-4 w-4" /> 
                                )}
                                {promotingCarId === car.id ? 'Preparing...' : 'Promote with Veo'}
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => openEditModal(car)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <Pencil className="h-4 w-4" /> Edit
                                </button>
                                <button onClick={() => handleDelete(car.id)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-colors">
                                    <Trash2 className="h-4 w-4" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        ) : activeTab === 'bookings' ? (
            <div className="space-y-4 max-w-4xl mx-auto">
                {myBookings.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-slate-200">
                        <div className="bg-slate-50 inline-block p-6 rounded-full mb-4">
                            <Calendar className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No requests yet</h3>
                        <p className="text-slate-500">Bookings will appear here when clients rent your cars.</p>
                    </div>
                ) : (
                    myBookings.map(booking => (
                        <div key={booking.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-56 h-auto rounded-2xl overflow-hidden relative flex-shrink-0 bg-slate-100">
                                    <img src={booking.carImage} alt="" className="w-full h-full object-cover min-h-[160px]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                                        <p className="text-white font-bold text-sm truncate">{booking.carName}</p>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                         <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/20 shadow-sm backdrop-blur-md ${
                                            booking.status === 'PENDING' ? 'bg-amber-400 text-white' :
                                            booking.status === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                            {booking.status}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 py-1">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-xs text-slate-400 font-medium">Request #{booking.id.slice(0,8)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                Booking for {booking.carName}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-indigo-600">${booking.totalPrice}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Revenue</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3">
                                                <Calendar className="h-5 w-5 text-indigo-500 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Trip Dates</p>
                                                    <p className="text-sm font-semibold text-slate-700">{booking.startDate} — {booking.endDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-indigo-500 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup</p>
                                                    <p className="text-sm font-semibold text-slate-700">{booking.pickupLocation}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Client Info Section */}
                                        <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                <User className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Client</p>
                                                <p className="text-sm font-bold text-slate-900 truncate">{booking.clientName}</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <a href={`mailto:${booking.clientEmail}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors">
                                                    <Mail className="h-3.5 w-3.5" /> Contact
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.status === 'PENDING' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'APPROVED')}
                                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                                            >
                                                <Check className="h-4 w-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                                                className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X className="h-4 w-4" /> Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        ) : (
            <div className="animate-fade-in">
                {/* Analytics KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 p-3 rounded-xl">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                                <h3 className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-indigo-100 p-3 rounded-xl">
                                <CarFront className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Completed Trips</p>
                                <h3 className="text-2xl font-bold text-slate-900">{totalTrips}</h3>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(totalTrips * 10, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-amber-100 p-3 rounded-xl">
                                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Fleet Rating</p>
                                <h3 className="text-2xl font-bold text-slate-900">{avgFleetRating.toFixed(1)} <span className="text-sm text-slate-400 font-medium">/ 5.0</span></h3>
                            </div>
                        </div>
                        <div className="flex gap-1">
                             {[1,2,3,4,5].map(s => (
                                 <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= Math.round(avgFleetRating) ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
                             ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
                            <button className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Last 6 Months</button>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-4">
                            {chartData.map((d) => (
                                <div key={d.month} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="w-full relative h-48 bg-slate-50 rounded-xl overflow-hidden flex items-end">
                                        <div 
                                            className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all duration-500 rounded-t-xl" 
                                            style={{ height: `${(d.value / maxChartValue) * 100}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg transition-opacity whitespace-nowrap">
                                                ${d.value}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions / Tips */}
                    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-12 -mb-12 blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Boost your earnings</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                Listings with video ads get 3x more bookings on average. Create a cinematic video for your top car today.
                            </p>
                        </div>
                        <button 
                            onClick={() => openVideoModal()}
                            className="relative z-10 w-full py-4 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Video className="h-4 w-4" /> Generate Video Ad
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {isModalOpen && (
        <CarModal 
          car={editingCar} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => {
             if (editingCar) {
                 updateCar({ ...editingCar, ...data, pricePerDay: Number(data.pricePerDay) });
             } else {
                 addCar({ ...data, pricePerDay: Number(data.pricePerDay) });
             }
             setIsModalOpen(false);
          }} 
        />
      )}

      {isVideoModalOpen && (
          <VideoGeneratorModal 
            onClose={() => setIsVideoModalOpen(false)} 
            initialFile={videoModalData.file}
            initialPrompt={videoModalData.prompt}
          />
      )}
    </div>
  );
};

interface CarModalProps {
    car: Car | null;
    onClose: () => void;
    onSave: (data: any) => void;
}

const CarModal = ({ car, onClose, onSave }: CarModalProps) => {
  const [formData, setFormData] = useState({
    name: car?.name || '',
    modelYear: car?.modelYear || new Date().getFullYear(),
    pricePerDay: car?.pricePerDay || '',
    description: car?.description || '',
    imageUrl: car?.imageUrl || '',
    category: car?.category || 'Sedan',
    status: car?.status || 'AVAILABLE',
    transmission: car?.transmission || 'Automatic'
  });
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateDesc = async () => {
    if (!formData.name) return;
    setLoadingAI(true);
    const desc = await generateCarDescription(formData.name, Number(formData.modelYear), formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{car ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <p className="text-xs text-slate-400 font-medium">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500 transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Make & Model</label>
              <input 
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Tesla Model 3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Year</label>
              <input 
                type="number"
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 outline-none"
                value={formData.modelYear}
                onChange={e => setFormData({...formData, modelYear: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
              <div className="relative">
                <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 outline-none appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sports">Sports</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <CarFront className="h-5 w-5" />
                </div>
              </div>
            </div>
             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Transmission</label>
              <div className="relative">
                <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 outline-none appearance-none"
                    value={formData.transmission}
                    onChange={e => setFormData({...formData, transmission: e.target.value as any})}
                >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Settings2 className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Daily Rate</label>
              <div className="relative">
                <input 
                    type="number"
                    required
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 outline-none"
                    value={formData.pricePerDay}
                    onChange={e => setFormData({...formData, pricePerDay: e.target.value})}
                />
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Image URL</label>
            <input 
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 outline-none text-sm"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <button 
                type="button"
                onClick={handleGenerateDesc}
                disabled={!formData.name || loadingAI}
                className="text-xs flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full font-bold transition-colors disabled:opacity-50"
              >
                {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                {loadingAI ? 'Generating...' : 'Auto-Generate'}
              </button>
            </div>
            <textarea 
              required
              rows={3}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600 outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the car..."
            />
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Vehicle Status</span>
              <span className="text-xs text-slate-400 font-medium">
                {formData.status === 'AVAILABLE' ? 'Available for booking' : 'Unavailable / Booked'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'AVAILABLE' ? 'BOOKED' : 'AVAILABLE' }))}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                formData.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`${
                  formData.status === 'AVAILABLE' ? 'translate-x-7' : 'translate-x-1'
                } inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-sm`}
              />
            </button>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/20 active:scale-[0.98] transform duration-100">
                {car ? 'Save Changes' : 'Add to Fleet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VideoGeneratorModal = ({ 
    onClose, 
    initialFile, 
    initialPrompt 
}: { 
    onClose: () => void; 
    initialFile?: File | null; 
    initialPrompt?: string; 
}) => {
    const [file, setFile] = useState<File | null>(initialFile || null);
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        if (initialFile) setFile(initialFile);
        if (initialPrompt) setPrompt(initialPrompt);
    }, [initialFile, initialPrompt]);

    const handleGenerate = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const url = await generateVeoVideo(file, prompt);
            setVideoUrl(url);
        } catch (error) {
            console.error(error);
            alert("Failed to generate video. Ensure you have selected an API Key.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10">
                    <X className="h-5 w-5 text-slate-500" />
                </button>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Video Ad</h2>
                <p className="text-slate-500 mb-6">Bring your car photos to life with AI video generation.</p>

                {!videoUrl ? (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                    <p className="font-bold text-slate-900">{file.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">Click to change</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Upload className="h-8 w-8 text-indigo-500" />
                                    </div>
                                    <p className="font-bold text-slate-900">Upload Car Photo</p>
                                    <p className="text-xs text-slate-500 mt-1">PNG or JPG recommended</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Custom Prompt (Optional)</label>
                            <input 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600 outline-none"
                                placeholder="E.g. Cinematic drone shot on a coastal highway..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-xs leading-relaxed">
                            <strong>Note:</strong> You will be prompted to select a paid API Key for video generation. This process may take a minute.
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={!file || loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" /> Generating Video...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-5 w-5" /> Generate Magic Video
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black aspect-video group">
                            <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-4">
                             <a 
                                href={videoUrl} 
                                download="car-ad.mp4"
                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                            >
                                <Upload className="h-4 w-4 rotate-180" /> Download
                            </a>
                            <button 
                                onClick={() => setVideoUrl('')}
                                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                            >
                                Generate Another
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}