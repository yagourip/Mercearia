import { AuthUser, UserRole } from '../types';
import { getSupabaseClient, getStoredSupabaseConfig } from './supabaseClient';

const STORAGE_SESSION_KEY = 'mercearia_auth_session';
const STORAGE_LOCAL_USERS_KEY = 'mercearia_local_registered_users';

interface LocalUserRecord {
  id: string;
  email: string;
  passwordHash: string; // simple encoded string for local storage mock
  name: string;
  role: UserRole;
  createdAt: string;
}

// Contas padrão de demonstração para acesso imediato
export const DEFAULT_DEMO_USERS: { email: string; password: string; name: string; role: UserRole; roleLabel: string }[] = [
  {
    email: 'gerente@mercearia.com.br',
    password: 'gerente123',
    name: 'Carlos Oliveira',
    role: 'gerente',
    roleLabel: 'Gerente Geral / Proprietário',
  },
  {
    email: 'atendente@mercearia.com.br',
    password: 'vendas123',
    name: 'Mariana Souza',
    role: 'atendente',
    roleLabel: 'Atendente de WhatsApp & Delivery',
  },
  {
    email: 'caixa@mercearia.com.br',
    password: 'caixa123',
    name: 'Roberto Silva',
    role: 'caixa',
    roleLabel: 'Operador de Balcão & Caixa',
  },
];

function getLocalRegisteredUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler usuários locais:', e);
    return [];
  }
}

function saveLocalRegisteredUsers(users: LocalUserRecord[]) {
  try {
    localStorage.setItem(STORAGE_LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Erro ao salvar usuários locais:', e);
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao obter usuário da sessão:', e);
  }
  return null;
}

export function saveSessionUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch (e) {
    console.error('Erro ao persistir sessão do usuário:', e);
  }
}

export async function loginUser(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return { success: false, error: 'Por favor, informe e-mail e senha.' };
  }

  const supabaseClient = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  // 1. Se o Supabase estiver configurado e conectado, tenta login via Supabase Auth
  if (supabaseClient && config.isConnected) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        const metadata = data.user.user_metadata || {};
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: metadata.name || metadata.full_name || email.split('@')[0],
          role: (metadata.role as UserRole) || 'gerente',
          provider: 'supabase',
          createdAt: data.user.created_at,
        };
        saveSessionUser(authUser);
        return { success: true, user: authUser };
      }

      // Se der erro no Supabase, mas for uma das contas de teste padrão, permite login local com aviso
      const isDemo = DEFAULT_DEMO_USERS.find(u => u.email === email && u.password === password);
      if (isDemo) {
        const authUser: AuthUser = {
          id: `demo-${isDemo.role}-${Date.now()}`,
          email: isDemo.email,
          name: isDemo.name,
          role: isDemo.role,
          provider: 'local',
          createdAt: new Date().toISOString(),
        };
        saveSessionUser(authUser);
        return { success: true, user: authUser };
      }

      return {
        success: false,
        error: error?.message || 'Credenciais inválidas no Supabase Auth.',
      };
    } catch (err: any) {
      console.warn('Erro na autenticação Supabase:', err);
    }
  }

  // 2. Validação local (Demo accounts e contas cadastradas localmente)
  const demoFound = DEFAULT_DEMO_USERS.find(
    u => u.email.toLowerCase() === email && u.password === password
  );

  if (demoFound) {
    const authUser: AuthUser = {
      id: `local-demo-${demoFound.role}`,
      email: demoFound.email,
      name: demoFound.name,
      role: demoFound.role,
      provider: 'local',
      createdAt: new Date().toISOString(),
    };
    saveSessionUser(authUser);
    return { success: true, user: authUser };
  }

  // Verifica cadastros manuais locais
  const localUsers = getLocalRegisteredUsers();
  const registered = localUsers.find(u => u.email.toLowerCase() === email);

  if (registered) {
    if (registered.passwordHash === btoa(password)) {
      const authUser: AuthUser = {
        id: registered.id,
        email: registered.email,
        name: registered.name,
        role: registered.role,
        provider: 'local',
        createdAt: registered.createdAt,
      };
      saveSessionUser(authUser);
      return { success: true, user: authUser };
    }
    return { success: false, error: 'Senha incorreta para este usuário.' };
  }

  return {
    success: false,
    error: 'Usuário não encontrado. Use uma das contas rápidas demonstrativas ou crie um novo cadastro na aba Cadastrar.',
  };
}

export async function registerUser(
  nameInput: string,
  emailInput: string,
  passwordInput: string,
  roleInput: UserRole = 'atendente'
): Promise<{ success: boolean; user?: AuthUser; error?: string; message?: string }> {
  const name = nameInput.trim();
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!name || name.length < 2) {
    return { success: false, error: 'Por favor, informe seu nome completo.' };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Por favor, informe um e-mail válido.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
  }

  const supabaseClient = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  // 1. Tenta cadastro no Supabase se configurado
  if (supabaseClient && config.isConnected) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: roleInput,
          },
        },
      });

      if (!error && data?.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          name,
          role: roleInput,
          provider: 'supabase',
          createdAt: data.user.created_at,
        };

        // Se o Supabase exigir confirmação por email, data.session pode ser null
        if (data.session) {
          saveSessionUser(authUser);
          return { success: true, user: authUser };
        } else {
          saveSessionUser(authUser);
          return {
            success: true,
            user: authUser,
            message: 'Conta criada com sucesso no Supabase! Você já pode utilizar o sistema.',
          };
        }
      }

      if (error) {
        return { success: false, error: `Supabase Auth: ${error.message}` };
      }
    } catch (err: any) {
      console.warn('Erro ao registrar no Supabase Auth:', err);
    }
  }

  // 2. Registro Local
  const localUsers = getLocalRegisteredUsers();
  if (localUsers.some(u => u.email.toLowerCase() === email)) {
    return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
  }

  const newRecord: LocalUserRecord = {
    id: `user-${Date.now()}`,
    email,
    passwordHash: btoa(password),
    name,
    role: roleInput,
    createdAt: new Date().toISOString(),
  };

  localUsers.push(newRecord);
  saveLocalRegisteredUsers(localUsers);

  const authUser: AuthUser = {
    id: newRecord.id,
    email: newRecord.email,
    name: newRecord.name,
    role: newRecord.role,
    provider: 'local',
    createdAt: newRecord.createdAt,
  };

  saveSessionUser(authUser);
  return { success: true, user: authUser };
}

export async function logoutUser(): Promise<void> {
  const supabaseClient = getSupabaseClient();
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
  }
  saveSessionUser(null);
}
