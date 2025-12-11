import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Car, Booking, UserRole, Review } from './types';
import { INITIAL_CARS, INITIAL_USERS, INITIAL_BOOKINGS, INITIAL_REVIEWS } from './mockData';

interface AppContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  cars: Car[];
  addCar: (car: Omit<Car, 'id' | 'ownerId'>) => void;
  updateCar: (car: Car) => void;
  deleteCar: (carId: string) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  updateBookingStatus: (bookingId: string, status: 'APPROVED' | 'REJECTED') => void;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  favorites: string[];
  toggleFavorite: (carId: string) => void;
  resetData: () => void;
  getOwnerById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to safely load from localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error loading ${key} from storage`, error);
    return fallback;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from LocalStorage or fallback to Mock Data
  const [user, setUser] = useState<User | null>(() => loadFromStorage('driveeasy_user', null));
  const [cars, setCars] = useState<Car[]>(() => loadFromStorage('driveeasy_cars', INITIAL_CARS));
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage('driveeasy_bookings', INITIAL_BOOKINGS));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage('driveeasy_reviews', INITIAL_REVIEWS));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage('driveeasy_favorites', []));

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('driveeasy_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('driveeasy_cars', JSON.stringify(cars));
  }, [cars]);

  useEffect(() => {
    localStorage.setItem('driveeasy_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('driveeasy_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('driveeasy_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const login = (email: string, role: UserRole) => {
    // Simple mock login with persistence
    const existingUser = INITIAL_USERS.find(u => u.email === email && u.role === role);
    const mockUser = existingUser || {
      id: role === UserRole.OWNER ? 'u1' : 'u2',
      name: role === UserRole.OWNER ? 'John Owner' : 'Alice Client',
      email,
      role
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('driveeasy_user');
  };

  const addCar = (newCarData: Omit<Car, 'id' | 'ownerId'>) => {
    if (!user) return;
    const newCar: Car = {
      ...newCarData,
      id: Math.random().toString(36).substr(2, 9),
      ownerId: user.id,
      rating: 0,
      reviewCount: 0
    };
    setCars(prev => [newCar, ...prev]);
  };

  const updateCar = (updatedCar: Car) => {
    setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
  };

  const deleteCar = (carId: string) => {
    setCars(prev => prev.filter(c => c.id !== carId));
  };

  const addBooking = (newBookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...newBookingData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const updateBookingStatus = (bookingId: string, status: 'APPROVED' | 'REJECTED') => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
        ...reviewData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    setReviews(prev => [...prev, newReview]);

    // Recalculate Car Rating
    const carReviews = [...reviews, newReview].filter(r => r.carId === reviewData.carId);
    const totalRating = carReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / carReviews.length;

    setCars(prev => prev.map(c => 
        c.id === reviewData.carId 
            ? { ...c, rating: Number(avgRating.toFixed(1)), reviewCount: carReviews.length } 
            : c
    ));
  };

  const toggleFavorite = (carId: string) => {
      setFavorites(prev => 
        prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
      );
  };

  const resetData = () => {
    setCars(INITIAL_CARS);
    setBookings(INITIAL_BOOKINGS);
    setReviews(INITIAL_REVIEWS);
    setFavorites([]);
    setUser(null);
    localStorage.clear();
  };

  const getOwnerById = (id: string) => {
      return INITIAL_USERS.find(u => u.id === id);
  };

  return (
    <AppContext.Provider value={{ 
      user, login, logout, 
      cars, addCar, updateCar, deleteCar, 
      bookings, addBooking, updateBookingStatus,
      reviews, addReview,
      favorites, toggleFavorite,
      resetData,
      getOwnerById
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};