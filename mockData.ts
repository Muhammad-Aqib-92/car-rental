import { Car, User, Booking, UserRole, Review } from './types';

export const INITIAL_CARS: Car[] = [
  {
    id: 'c1',
    ownerId: 'u1',
    name: 'Tesla Model 3',
    modelYear: 2023,
    pricePerDay: 120,
    description: 'Experience the future of driving with this pristine electric sedan. Autopilot enabled.',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
    status: 'AVAILABLE',
    category: 'Sedan',
    transmission: 'Automatic',
    rating: 4.8,
    reviewCount: 12
  },
  {
    id: 'c2',
    ownerId: 'u1',
    name: 'Range Rover Sport',
    modelYear: 2022,
    pricePerDay: 250,
    description: 'Luxury SUV perfect for family trips or business travel. Unmatched comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800',
    status: 'AVAILABLE',
    category: 'SUV',
    transmission: 'Automatic',
    rating: 4.9,
    reviewCount: 8
  },
  {
    id: 'c3',
    ownerId: 'u1',
    name: 'Porsche 911 Carrera',
    modelYear: 2024,
    pricePerDay: 450,
    description: 'The iconic sports car. Feel the thrill of the road with precision engineering.',
    imageUrl: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800',
    status: 'BOOKED',
    category: 'Sports',
    transmission: 'Automatic',
    rating: 5.0,
    reviewCount: 5
  }
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'John Owner', email: 'owner@test.com', role: UserRole.OWNER },
  { id: 'u2', name: 'Alice Client', email: 'client@test.com', role: UserRole.CLIENT }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    carId: 'c3',
    clientId: 'u2',
    ownerId: 'u1',
    startDate: '2024-06-10',
    endDate: '2024-06-15',
    pickupLocation: 'LAX Airport',
    totalPrice: 2250,
    status: 'APPROVED',
    createdAt: '2024-06-01T10:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    bookingId: 'b1',
    carId: 'c3',
    clientId: 'u2',
    rating: 5,
    comment: 'Absolute beast of a machine. Clean, fast, and the owner was super helpful!',
    createdAt: '2024-06-16T12:00:00Z'
  }
];