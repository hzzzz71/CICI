export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  colors?: string[];
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isSale?: boolean;
  isLimited?: boolean;
  stock?: number;
  stockLow?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: number;
  selectedColor: string;
}

export interface User {
  name: string;
  email: string;
  memberSince: string;
  avatarInitials: string;
}
