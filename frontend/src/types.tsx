export interface Transaction {
    collect_id: string;
    school_id: string;
    gateway: string;
    order_amount: number;
    transaction_amount: number;
    status: string;
    custom_order_id: string;
  }
  
  export interface User {
    name: string;
    email: string;
    role: 'admin' | 'trustee' | 'school_staff';
  }

  export interface UserRegisterData {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'trustee' | 'school_staff';
  }

  export interface LoginResponse {
    token: string;
  }