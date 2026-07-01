import { NZCity, PostModuleKey } from '../constants';

export interface User {
  id: string; 
  email: string; 
  name: string;
  cityNz?: string; 
  avatarUrl?: string; 
  bio?: string; 
  createdAt: string;
}

export interface AuthTokens { accessToken: string; refreshToken: string; }
export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; name: string; city?: string; }

export interface Post {
  id: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  module: PostModuleKey;
  title: string;
  description: string;
  city: string;
  price?: number;
  images?: string[];
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  likedByMe?: boolean;
  likeCount?: number;
  commentCount?: number;
  metadata?: Record<string, unknown>;
}

export interface PostFilters {
  module?: PostModuleKey; city?: NZCity | string;
  minPrice?: number; maxPrice?: number;
  tipoAlojamiento?: string; disponibleDesde?: string;
  tipoTrabajo?: string; categoria?: string; condicion?: string;
}

export interface Comment {
  id: string; postId: string; userId: string; content: string; createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export type TripStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  driver?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  origin: string; destination: string;
  departureAt: string;
  seatsTotal: number; seatsAvailable: number;
  price?: number; notes?: string;
  status: TripStatus; createdAt: string;
}

export interface TripBooking {
  id: string; passengerId: string; status: 'CONFIRMED' | 'CANCELLED';
  passenger?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface TripWithBookings extends Trip { bookings?: TripBooking[]; }

export interface TripFilters {
  origin?: string; destination?: string; date?: string;
  status?: TripStatus;
}

export interface Message {
  id: string; senderId: string; receiverId: string;
  postId?: string; content: string; readAt?: string; createdAt: string;
}

export interface Conversation {
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  lastMessage?: Message;
  unreadCount: number;
}

export interface ApiResponse<T> { success: boolean; data?: T; message?: string; error?: string; }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; limit: number; hasMore: boolean; }
