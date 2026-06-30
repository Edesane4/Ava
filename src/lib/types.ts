// ─────────────────────────────────────────────────────────────
// Shared domain types — mirror the Supabase schema in supabase/schema.sql
// ─────────────────────────────────────────────────────────────

export type UserRole = "customer" | "provider";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export type PaymentMethod =
  | "pay_now"
  | "cash"
  | "venmo"
  | "zelle"
  | "apple_cash";

export type ServiceCategory = "walk" | "home_care";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  breed: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  duration_min: number | null;
  price_cents: number;
  emoji: string | null;
  active: boolean;
  sort_order: number;
}

export interface Booking {
  id: string;
  customer_id: string;
  pet_id: string | null;
  service_id: string | null;
  service_name: string | null;
  pet_name: string | null;
  price_cents: number;
  scheduled_at: string;
  duration_min: number | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  special_instructions: string | null;
  status: BookingStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
  // Optional joined relations (when selected with `*, pets(*)` etc.)
  pets?: Pet | null;
  services?: Service | null;
  profiles?: Profile | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  booking_id: string | null;
  read: boolean;
  created_at: string;
}

// Draft used by the multi-step booking flow before it's saved.
export interface BookingDraft {
  service: Service | null;
  scheduledAt: string | null; // ISO string
  petId: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  specialInstructions: string;
  paymentMethod: PaymentMethod;
}
