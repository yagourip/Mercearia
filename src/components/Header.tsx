import React from 'react';
import { 
  Store, 
  Database, 
  PlusCircle, 
  RotateCw, 
  MessageSquare, 
  BarChart3, 
  Sparkles,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { SupabaseConfig, AuthUser } from '../types';

interface HeaderProps {
  supabaseConfig: SupabaseConfig;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenNewDeal: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenRepurchaseAlerts: () => void;
  onOpenWhatsAppTemplates: () => void;
  onToggleAnalytics: () => void;
  showAnalytics: boolean;
  repurchaseCount: number;
  isSyncing: boolean;
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  supabaseConfig,
  currentUser,
  onLogout,
  onOpenNewDeal,
  onOpenSupabaseConfig,
  onOpenRepurchaseAlerts,
  onOpenWhatsAppTemplates,
  onToggleAnalytics,
  showAnalytics,
  repurchaseCount,
  isSyncing,
  onRefreshData,
}) => {
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'gerente': return 'Gerente';
      case 'atendente': return 'Atendente';
      case 'caixa': return 'Caixa';
      default: return 'Usuário';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900">
                  Funil da Mercearia
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Vendas & Pós-Venda
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Gestão comercial, orçamentos, cestas e recompra do comércio de bairro
              </p>
            </div>
          </div>

          {/* Action buttons & User Session */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Refresh button */}
            <button
              onClick={onRefreshData}
              disabled={isSyncing}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
              title="Atualizar dados"
            >
              <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* WhatsApp Templates */}
            <button
              onClick={onOpenWhatsAppTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors"
              title="Modelos de mensagens para WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Mensagens WhatsApp</span>
            </button>

            {/* Repurchase Radar */}
            <button
              onClick={onOpenRepurchaseAlerts}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              title="Radar de clientes para recompra"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Radar Recompra</span>
              {repurchaseCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-purple-600 text-white rounded-full">
                  {repurchaseCount}
                </span>
              )}
            </button>

            {/* Analytics Toggle */}
            <button
              onClick={onToggleAnalytics}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showAnalytics
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'text-stone-700 bg-stone-100 hover:bg-stone-200 border-stone-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showAnalytics ? 'Ver Funil Kanban' : 'Métricas & Relatório'}</span>
            </button>

            {/* Primary New Deal Button */}
            <button
              onClick={onOpenNewDeal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Pedido</span>
            </button>

            {/* Supabase Small Corner Icon Button */}
            <button
              onClick={onOpenSupabaseConfig}
              className={`relative p-2 rounded-lg border transition-all ${
                supabaseConfig.isConnected
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : 'text-stone-400 bg-stone-50 border-stone-200 hover:text-stone-600 hover:bg-stone-100'
              }`}
              title={supabaseConfig.isConnected ? 'Supabase Conectado (Clique para gerenciar banco)' : 'Supabase (Clique para configurar banco de dados)'}
            >
              <Database className="w-4 h-4" />
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  supabaseConfig.isConnected ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
              />
            </button>

            {/* User Profile & Logout */}
            {currentUser && (
              <div className="flex items-center pl-1 sm:pl-2 border-l border-stone-200 ml-1">
                <div 
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-stone-50 transition-colors"
                  title={`Conectado como ${currentUser.name} (${currentUser.email})`}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-900 truncate max-w-[120px] leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-medium text-stone-500 leading-tight">
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Deseja realmente sair da conta?')) {
                      onLogout();
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5"
                  title="Sair / Desconectar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

