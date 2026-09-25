export type FunnelStage = 'lead' | 'contacted' | 'proposal' | 'won' | 'loyalty' | 'lost';

export interface DealItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'kg' | 'un' | 'pct' | 'cx' | 'lt';
  unit_price: number;
  total: number;
}

export interface GroceryProduct {
  id: string;
  name: string;
  category: 'hortifruti' | 'mercearia' | 'frios_laticinios' | 'bebidas' | 'limpeza' | 'padaria' | 'carnes';
  default_unit: 'kg' | 'un' | 'pct' | 'cx' | 'lt';
  price: number;
}

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'caderneta_fiado';

export type DealSource = 'whatsapp' | 'balcao' | 'panfleto_encarte' | 'indicacao' | 'ifood_local';

export interface Deal {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_neighborhood: string;
  customer_address?: string;
  stage: FunnelStage;
  items: DealItem[];
  total_value: number;
  delivery_type: DeliveryType;
  payment_method: PaymentMethod;
  source: DealSource;
  notes?: string;
  lost_reason?: string;
  last_purchase_date?: string;
  expected_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  tableName: string;
}

export interface StageConfig {
  id: FunnelStage;
  title: string;
  description: string;
  color: string;
  bgLight: string;
  borderLight: string;
  icon: string;
}

export type UserRole = 'gerente' | 'atendente' | 'caixa';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  provider: 'supabase' | 'local';
  createdAt?: string;
}
