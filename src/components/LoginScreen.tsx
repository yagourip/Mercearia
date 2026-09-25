import React, { useState } from 'react';
import { AuthUser, SupabaseConfig, UserRole } from '../types';
import { 
  loginUser, 
  registerUser, 
  DEFAULT_DEMO_USERS 
} from '../services/authService';
import { 
  Store, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Database,
  UserCheck
} from 'lucide-react';

interface LoginScreenProps {
  supabaseConfig: SupabaseConfig;
  onLoginSuccess: (user: AuthUser) => void;
  onOpenSupabaseConfig?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  supabaseConfig,
  onLoginSuccess,
  onOpenSupabaseConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('gerente@mercearia.com.br');
  const [loginPassword, setLoginPassword] = useState('gerente123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('atendente');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await loginUser(loginEmail, loginPassword);
      if (res.success && res.user) {
        setSuccessMessage(`Bem-vindo de volta, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await registerUser(regName, regEmail, regPassword, regRole);
      if (res.success && res.user) {
        setSuccessMessage(res.message || `Cadastro realizado! Bem-vindo(a), ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 500);
      } else {
        setErrorMessage(res.error || 'Erro ao criar conta.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demo: typeof DEFAULT_DEMO_USERS[0]) => {
    setLoginEmail(demo.email);
    setLoginPassword(demo.password);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginUser(demo.email, demo.password);
      if (res.success && res.user) {
        setSuccessMessage(`Acesso rápido autorizado: ${res.user.name}`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 300);
      }
    } catch (err: any) {
      setErrorMessage('Erro no login rápido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center px-4 py-8 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-emerald-800 to-stone-100 -z-10" />

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200/80 overflow-hidden relative">
        
        {/* Brand Banner Top */}
        <div className="bg-emerald-900 text-white p-6 pb-7 text-center relative">
          {/* Subtle Corner Database Icon */}
          <button
            type="button"
            onClick={onOpenSupabaseConfig}
            className={`absolute top-4 right-4 p-2 rounded-xl transition-all border ${
              supabaseConfig.isConnected
                ? 'bg-emerald-800/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-800'
                : 'bg-emerald-950/50 text-emerald-300/60 border-emerald-800/40 hover:text-emerald-200 hover:bg-emerald-900/60'
            }`}
            title={supabaseConfig.isConnected ? 'Supabase Conectado' : 'Configurar Banco Supabase'}
          >
            <Database className="w-3.5 h-3.5" />
            <span
              className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                supabaseConfig.isConnected ? 'bg-emerald-400' : 'bg-stone-400'
              }`}
            />
          </button>

          <div className="inline-flex p-3 rounded-2xl bg-emerald-800/80 text-emerald-300 ring-4 ring-emerald-700/50 mb-3 shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Funil de Vendas da Mercearia
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1 max-w-xs mx-auto">
            Faça login para gerenciar pedidos, clientes, delivery, caderneta e recompra
          </p>
        </div>

        {/* Tab switcher: Entrar / Cadastrar */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Entrar na Minha Conta
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Cadastrar Novo Acesso
          </button>
        </div>

        {/* Error / Success Alerts */}
        <div className="p-6 pb-2">
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seu-email@mercearia.com.br"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha secreta"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="p-1 text-stone-400 hover:text-stone-600 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>{isLoading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  E-mail de Trabalho
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="joao@mercearia.com.br"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Crie uma senha segura"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="p-1 text-stone-400 hover:text-stone-600 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Função / Cargo na Mercearia
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                >
                  <option value="gerente">Gerente Geral / Proprietário (Acesso Total)</option>
                  <option value="atendente">Atendente de WhatsApp & Vendas (Funil Comercial)</option>
                  <option value="caixa">Operador de Balcão & Caixa</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>{isLoading ? 'Cadastrando...' : 'Criar Conta e Acessar'}</span>
                <UserCheck className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* DEMO / QUICK ACCESS SECTION */}
        <div className="p-6 pt-3 bg-stone-50 border-t border-stone-100">
          <div className="flex items-center gap-1.5 mb-2.5 text-stone-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
              Contas de Acesso Rápido para Teste
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEFAULT_DEMO_USERS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleQuickDemoLogin(demo)}
                className="p-2.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-stone-800 group-hover:text-emerald-800 flex items-center gap-1.5">
                    <span>{demo.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                      {demo.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {demo.email} • Senha: <span className="font-mono">{demo.password}</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-700 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                  Entrar
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-stone-500 max-w-sm">
        <p>Sistema Comercial & Funil de Vendas de Mercearia.</p>
        <p className="mt-0.5 text-stone-400 text-[11px]">
          Suporta autenticação em nuvem Supabase e modo local sincronizado.
        </p>
      </div>

    </div>
  );
};
