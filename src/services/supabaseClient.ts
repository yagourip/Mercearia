import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Deal, SupabaseConfig } from '../types';
import { INITIAL_DEALS } from './mockData';

const STORAGE_KEY_CONFIG = 'mercearia_supabase_config';
const STORAGE_KEY_DEALS = 'mercearia_deals_local_v1';
export const SUPABASE_TABLE_NAME = 'mercearia_funnel_deals';

export const SQL_SCHEMA_INSTRUCTIONS = `-- 🛒 SCRIPT SQL DE CRIAÇÃO PARA O SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS mercearia_funnel_deals (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_neighborhood TEXT NOT NULL,
  customer_address TEXT,
  stage TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_type TEXT NOT NULL DEFAULT 'delivery',
  payment_method TEXT NOT NULL DEFAULT 'pix',
  source TEXT NOT NULL DEFAULT 'whatsapp',
  notes TEXT,
  lost_reason TEXT,
  last_purchase_date TIMESTAMPTZ,
  expected_delivery_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ativar Row Level Security (RLS)
ALTER TABLE mercearia_funnel_deals ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para a chave anônima (pública da mercearia)
DROP POLICY IF EXISTS "Acesso total aos pedidos da mercearia" ON mercearia_funnel_deals;

CREATE POLICY "Acesso total aos pedidos da mercearia" 
  ON mercearia_funnel_deals 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
`;

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        isConnected: Boolean(parsed.isConnected && (parsed.url || envUrl)),
        tableName: SUPABASE_TABLE_NAME,
      };
    }
  } catch (e) {
    console.error('Erro ao ler config do Supabase do localStorage', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: Boolean(envUrl && envKey),
    tableName: SUPABASE_TABLE_NAME,
  };
}

export function saveStoredSupabaseConfig(config: { url: string; anonKey: string; isConnected: boolean }) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
    url: config.url.trim(),
    anonKey: config.anonKey.trim(),
    isConnected: config.isConnected,
  }));
}

let cachedClient: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    cachedClient = null;
    return null;
  }

  const keySignature = `${config.url}::${config.anonKey}`;
  if (cachedClient && currentClientKey === keySignature) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    currentClientKey = keySignature;
    return cachedClient;
  } catch (err) {
    console.error('Falha ao inicializar cliente Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; tableExists: boolean }> {
  try {
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      return {
        success: false,
        message: 'A URL do Supabase deve começar com "https://" e conter ".supabase.co" (ex: https://xyzcompany.supabase.co)',
        tableExists: false,
      };
    }

    if (!anonKey || anonKey.length < 20) {
      return {
        success: false,
        message: 'Chave Anon do Supabase inválida ou muito curta.',
        tableExists: false,
      };
    }

    const testClient = createClient(url, anonKey);
    // Testa ping na tabela
    const { data, error } = await testClient
      .from(SUPABASE_TABLE_NAME)
      .select('id')
      .limit(1);

    if (error) {
      // Se der erro 42P01 quer dizer que conectou no Supabase, mas a tabela ainda não foi criada no SQL Editor
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Conexão com o Supabase estabelecida com sucesso! Porém a tabela "mercearia_funnel_deals" ainda não foi criada. Use o script SQL fornecido abaixo.',
          tableExists: false,
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message}`,
        tableExists: false,
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida com sucesso! Tabela de funil encontrada no Supabase.',
      tableExists: true,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Erro ao tentar conectar: ${e?.message || 'Falha de rede'}`,
      tableExists: false,
    };
  }
}

// Funções de armazenamento e persistência com fallback local
export function getLocalDeals(): Deal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(INITIAL_DEALS));
      return INITIAL_DEALS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler negócios locais:', e);
    return INITIAL_DEALS;
  }
}

export function saveLocalDeals(deals: Deal[]) {
  try {
    localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(deals));
  } catch (e) {
    console.error('Erro ao salvar negócios locais:', e);
  }
}

export async function fetchAllDeals(): Promise<{ deals: Deal[]; isFromSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (client && config.isConnected) {
    try {
      const { data, error } = await client
        .from(SUPABASE_TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Se a tabela do Supabase estiver vazia pela primeira vez, mantemos ou migramos os iniciais
        if (data.length === 0) {
          const locals = getLocalDeals();
          return { deals: locals, isFromSupabase: true };
        }
        return { deals: data as Deal[], isFromSupabase: true };
      }
      
      console.warn('Erro ao buscar do Supabase, caindo para LocalStorage:', error?.message);
      return {
        deals: getLocalDeals(),
        isFromSupabase: false,
        error: `Supabase: ${error?.message || 'Tabela não encontrada. Crie a tabela via SQL Editor.'}`
      };
    } catch (err: any) {
      return {
        deals: getLocalDeals(),
        isFromSupabase: false,
        error: `Falha de rede com Supabase: ${err?.message}`
      };
    }
  }

  return { deals: getLocalDeals(), isFromSupabase: false };
}

export async function persistDeal(deal: Deal): Promise<{ success: boolean; isSupabase: boolean; error?: string }> {
  // Salva no local storage para garantir redundância
  const locals = getLocalDeals();
  const idx = locals.findIndex(d => d.id === deal.id);
  let updatedLocals: Deal[];
  if (idx >= 0) {
    updatedLocals = [...locals];
    updatedLocals[idx] = deal;
  } else {
    updatedLocals = [deal, ...locals];
  }
  saveLocalDeals(updatedLocals);

  const client = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (client && config.isConnected) {
    try {
      const { error } = await client
        .from(SUPABASE_TABLE_NAME)
        .upsert(deal, { onConflict: 'id' });

      if (error) {
        return { success: true, isSupabase: false, error: `Salvo localmente. Erro no Supabase: ${error.message}` };
      }
      return { success: true, isSupabase: true };
    } catch (err: any) {
      return { success: true, isSupabase: false, error: `Salvo localmente. Erro de rede no Supabase: ${err?.message}` };
    }
  }

  return { success: true, isSupabase: false };
}

export async function removeDeal(id: string): Promise<{ success: boolean; isSupabase: boolean }> {
  const locals = getLocalDeals();
  const filtered = locals.filter(d => d.id !== id);
  saveLocalDeals(filtered);

  const client = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (client && config.isConnected) {
    try {
      await client.from(SUPABASE_TABLE_NAME).delete().eq('id', id);
      return { success: true, isSupabase: true };
    } catch (err) {
      console.warn('Erro ao deletar no Supabase:', err);
    }
  }

  return { success: true, isSupabase: false };
}

export async function syncAllLocalToSupabase(): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase não está configurado.');
  }

  const localDeals = getLocalDeals();
  if (localDeals.length === 0) {
    return { count: 0 };
  }

  const { error } = await client
    .from(SUPABASE_TABLE_NAME)
    .upsert(localDeals, { onConflict: 'id' });

  if (error) {
    throw new Error(error.message);
  }

  return { count: localDeals.length };
}
