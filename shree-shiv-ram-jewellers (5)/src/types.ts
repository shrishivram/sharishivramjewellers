export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_featured: boolean;
  reviews?: Review[];
}

export interface User {
  id: number;
  email?: string;
  phone?: string;
  aadharNumber?: string;
  name: string;
  avatar?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
}

export interface Deal {
  id: number;
  title: string;
  description: string;
  discount: string;
  image: string;
  expiry_date: string;
}
