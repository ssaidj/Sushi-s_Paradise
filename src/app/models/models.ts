export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  status?: string; // 'student' ou autre
  api_token?: string;
}

export interface Box {
  id: number;
  name: string;
  description: string;
  price: number;
  size?: 'small' | 'large';
  image?: string;
  image_url?: string;
  foods?: { name: string; quantity: number }[];
  flavors?: string[];
  isStudentOffer?: boolean; // Indique si le produit bénéficie de la réduction étudiante
}

export interface CartItem {
  box: Box;
  quantity: number;
  extras?: {
    sauceSalee?: boolean;
    sauceSucree?: boolean;
    gingembre?: boolean;
    wasabi?: boolean;
  };
}


export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  created_at?: string;
}

export interface OrderItem {
  order_id: number;
  box_id: number;
  quantity: number;
  unit_price: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}
