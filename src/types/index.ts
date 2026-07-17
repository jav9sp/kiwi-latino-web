import { PostModuleKey } from '../constants';

export interface User {
  id: string;
  email: string;
  name: string;
  cityNz?: string;
  countryOrigin?: string;
  avatarUrl?: string;
  bio?: string;
  oficio?: string;
  descripcionServicio?: string;
  imagenOficio?: string;
  contactoDirectorio?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  createdAt: string;
}

export interface AuthTokens { accessToken: string; refreshToken: string; }
export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; name: string; cityNz?: string; countryOrigin?: string; }

export interface Post {
  id: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  module: PostModuleKey;
  title: string;
  description: string;
  city: string;
  price?: number;
  currency?: string;
  images?: string[];
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  likedByMe?: boolean;
  savedByMe?: boolean;
  likeCount?: number;
  commentCount?: number;
  metadata?: Record<string, unknown>;
}

export interface PostFilters {
  module?: PostModuleKey; city?: string;
  minPrice?: number; maxPrice?: number;
  housingTipo?: 'busqueda' | 'oferta'; disponibleDesde?: string;
  tipoTrabajo?: string; categoria?: string; condicion?: string;
}

export interface Comment {
  id: string; postId: string; userId: string; content: string; createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export type TripStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  origin: string; destination: string;
  departureDate: string;
  seatsTotal: number; seatsAvailable: number;
  costPerPerson?: number; currency?: string; notes?: string;
  status: TripStatus; createdAt: string;
}

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface TripBooking {
  id: string;
  seats: number;
  status: BookingStatus;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
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
