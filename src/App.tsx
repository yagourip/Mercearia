import React, { useState, useEffect, useCallback } from 'react';
import { Deal, FunnelStage, SupabaseConfig, AuthUser } from './types';
import { 
  fetchAllDeals, 
  persistDeal, 
  removeDeal, 
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig
} from './services/supabaseClient';
import { getCurrentUser, logoutUser } from './services/authService';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { KanbanBoard } from './components/KanbanBoard';
import { DealModal } from './components/DealModal';
import { SupabaseModal } from './components/SupabaseModal';
import { RepurchaseAlertsModal } from './components/RepurchaseAlertsModal';
import { WhatsAppTemplateModal } from './components/WhatsAppTemplateModal';
import { AnalyticsView } from './components/AnalyticsView';
import { LoginScreen } from './components/LoginScreen';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [deals, setDeals] = useState<Deal[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Modals state
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<FunnelStage>('lead');
  
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isRepurchaseModalOpen, setIsRepurchaseModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // Notification banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Load deals on start or when refreshed
  const loadDeals = useCallback(async (showSyncIndicator = false) => {
    if (showSyncIndicator) setIsSyncing(true);
    try {
      const res = await fetchAllDeals();
      setDeals(res.deals);
      if (res.error && supabaseConfig.isConnected) {
        showNotification(res.error, 'warning');
      }
    } catch (err: any) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setIsLoading(false);
      if (showSyncIndicator) setIsSyncing(false);
    }
  }, [supabaseConfig.isConnected]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  // Handle create or update deal
  const handleSaveDeal = async (savedDeal: Deal) => {
    // Optimistic UI update
    setDeals(prev => {
      const idx = prev.findIndex(d => d.id === savedDeal.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedDeal;
        return copy;
      }
      return [savedDeal, ...prev];
    });

    if (savedDeal.stage === 'won' && (!editingDeal || editingDeal.stage !== 'won')) {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 } });
      showNotification(`🎉 Parabéns! Venda de ${savedDeal.customer_name} no valor de R$ ${savedDeal.total_value.toFixed(2)} concluída com sucesso!`);
    } else {
      showNotification(`Pedido de ${savedDeal.customer_name} salvo com sucesso!`);
    }

    // Persist to Supabase or LocalStorage
    await persistDeal(savedDeal);
  };

  // Handle stage movement
  const handleMoveStage = async (id: string, newStage: FunnelStage) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;

    const updatedDeal: Deal = {
      ...deal,
      stage: newStage,
      updated_at: new Date().toISOString(),
    };

    setDeals(prev => prev.map(d => d.id === id ? updatedDeal : d));

    if (newStage === 'won') {
      confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
      showNotification(`🎉 Venda Concluída! Pedido de ${deal.customer_name} faturado com sucesso!`);
    } else if (newStage === 'loyalty') {
      showNotification(`Cliente ${deal.customer_name} adicionado ao ciclo de Fidelização & Recompra!`);
    }

    await persistDeal(updatedDeal);
  };

  // Handle delete
  const handleDeleteDeal = async (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    showNotification('Pedido removido do funil.', 'info');
    await removeDeal(id);
  };

  // Quick Open Modal for specific stage or customer
  const handleOpenNewDeal = (stage: FunnelStage = 'lead') => {
    setEditingDeal(null);
    setDefaultStage(stage);
    setIsDealModalOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setIsDealModalOpen(true);
  };

  const handleNewOrderForCustomer = (name: string, phone: string, neighborhood: string) => {
    setEditingDeal({
      id: `deal-${Date.now()}`,
      customer_name: name,
      customer_phone: phone,
      customer_neighborhood: neighborhood,
      stage: 'proposal',
      source: 'whatsapp',
      delivery_type: 'delivery',
      payment_method: 'pix',
      items: [],
      total_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsDealModalOpen(true);
  };

  // Repurchase count calculation (customers whose last purchase was >= 3 days ago)
  const repurchaseCandidateCount = deals.filter(d => ['won', 'loyalty'].includes(d.stage)).length;

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showNotification('Você saiu da sua conta com sucesso.', 'info');
  };

  // Se não estiver logado, exibe a tela de login
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          supabaseConfig={supabaseConfig}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showNotification(`Bem-vindo, ${user.name}!`);
          }}
          onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          config={supabaseConfig}
          onConfigUpdated={(cfg) => setSupabaseConfig(cfg)}
          onRefreshData={() => loadDeals(true)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header */}
      <Header
        supabaseConfig={supabaseConfig}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenNewDeal={() => handleOpenNewDeal('lead')}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        onOpenRepurchaseAlerts={() => setIsRepurchaseModalOpen(true)}
        onOpenWhatsAppTemplates={() => setIsWhatsAppModalOpen(true)}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        showAnalytics={showAnalytics}
        repurchaseCount={repurchaseCandidateCount}
        isSyncing={isSyncing}
        onRefreshData={() => loadDeals(true)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
            notification.type === 'warning' ? 'bg-amber-900 text-white border-amber-700' :
            'bg-stone-900 text-white border-stone-800'
          }`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Metrics Cards */}
        <MetricsBar deals={deals} />

        {/* Content View: Kanban Board vs Analytics View */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-stone-500 font-medium">Carregando pedidos da mercearia...</span>
          </div>
        ) : showAnalytics ? (
          <AnalyticsView
            deals={deals}
            onBackToKanban={() => setShowAnalytics(false)}
          />
        ) : (
          <KanbanBoard
            deals={deals}
            onEditDeal={handleEditDeal}
            onDeleteDeal={handleDeleteDeal}
            onMoveStage={handleMoveStage}
            onQuickNewDeal={handleOpenNewDeal}
          />
        )}
      </main>

      {/* Modals */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onSave={handleSaveDeal}
        initialDeal={editingDeal}
        defaultStage={defaultStage}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onConfigUpdated={(cfg) => setSupabaseConfig(cfg)}
        onRefreshData={() => loadDeals(true)}
      />

      <RepurchaseAlertsModal
        isOpen={isRepurchaseModalOpen}
        onClose={() => setIsRepurchaseModalOpen(false)}
        deals={deals}
        onNewOrderForCustomer={handleNewOrderForCustomer}
      />

      <WhatsAppTemplateModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-5 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Mercearia & Hortifruti • Sistema Comercial com Funil de Vendas e Retenção
          </span>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Integração Supabase</span>
            <span>•</span>
            <span>Delivery & Balcão</span>
            <span>•</span>
            <span>WhatsApp Direto</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
