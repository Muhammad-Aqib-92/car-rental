export enum UserRole {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Review {
  id: string;
  bookingId: string;
  carId: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Car {
  id: string;
  ownerId: string;
  name: string;
  modelYear: number;
  pricePerDay: number;
  description: string;
  imageUrl: string;
  status: 'AVAILABLE' | 'BOOKED';
  category: 'SUV' | 'Sedan' | 'Luxury' | 'Sports';
  transmission: 'Automatic' | 'Manual';
  rating?: number;
  reviewCount?: number;
}

export interface Booking {
  id: string;
  carId: string;
  clientId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface BookingWithCar extends Booking {
  carName: string;
  carImage: string;
  clientName?: string;
  clientEmail?: string;
  hasReview?: boolean;
}