import React from 'react';
import { Deal } from '../types';
import { 
  X, 
  Sparkles, 
  Clock, 
  Phone, 
  MessageCircle, 
  ShoppingBag, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface RepurchaseAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  onNewOrderForCustomer: (customerName: string, phone: string, neighborhood: string) => void;
}

export const RepurchaseAlertsModal: React.FC<RepurchaseAlertsModalProps> = ({
  isOpen,
  onClose,
  deals,
  onNewOrderForCustomer,
}) => {
  if (!isOpen) return null;

  // Candidates for repurchase:
  // Customers in 'won' or 'loyalty' whose last order was created over 2 days ago
  // We can group by customer_name
  const customerMap = new Map<string, { lastDeal: Deal; count: number }>();

  deals.forEach(deal => {
    const existing = customerMap.get(deal.customer_name);
    if (!existing) {
      customerMap.set(deal.customer_name, { lastDeal: deal, count: 1 });
    } else {
      existing.count += 1;
      const existingDate = new Date(existing.lastDeal.created_at).getTime();
      const currentDate = new Date(deal.created_at).getTime();
      if (currentDate > existingDate) {
        existing.lastDeal = deal;
      }
    }
  });

  const now = Date.now();
  const repurchaseCandidates = Array.from(customerMap.values()).map(({ lastDeal, count }) => {
    const orderTime = new Date(lastDeal.created_at).getTime();
    const daysSince = Math.max(1, Math.round((now - orderTime) / (1000 * 3600 * 24)));
    return {
      deal: lastDeal,
      count,
      daysSince,
      isOverdue: daysSince >= 3,
    };
  }).sort((a, b) => b.daysSince - a.daysSince);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSendWhatsAppRepurchase = (cand: typeof repurchaseCandidates[0]) => {
    const cleanPhone = cand.deal.customer_phone.replace(/\D/g, '');
    if (!cleanPhone) return;

    const message = `Olá ${cand.deal.customer_name}! Tudo bem? Aqui é da Mercearia & Hortifruti. ` +
      `Passando para avisar que recebemos frutas e verduras fresquinhas hoje! ` +
      `Gostaria de repor seus itens da feira ou a despensa para esta semana? Podemos separar para entrega! 🛒🥦🍎`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-purple-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Radar de Recompra da Mercearia
              </h3>
              <p className="text-xs text-purple-200/80">
                Identifique vizinhos e clientes fiéis que precisam repor feira e despensa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              Mercearias lucram na frequência! Mantenha contato ativo com quem já comprou: envie a feira da semana, informe promoções de carnes e laticínios frescos ou lembre de repor itens essenciais (arroz, feijão, ovos, café).
            </p>
          </div>

          <div className="space-y-3">
            {repurchaseCandidates.map((cand) => {
              const { deal, count, daysSince, isOverdue } = cand;
              return (
                <div
                  key={deal.customer_name}
                  className="p-4 rounded-xl border border-stone-200 bg-white hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{deal.customer_name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {count} {count === 1 ? 'pedido histórico' : 'pedidos no histórico'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Última compra há <strong>{daysSince} dias</strong>
                      </span>
                      <span>•</span>
                      <span>Bairro: {deal.customer_neighborhood}</span>
                      <span>•</span>
                      <span className="font-semibold text-stone-800">
                        Último valor: {formatBRL(deal.total_value)}
                      </span>
                    </div>

                    {deal.items && deal.items.length > 0 && (
                      <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                        Costuma comprar: {deal.items.map(it => it.name).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppRepurchase(cand)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Enviar lembrete pelo WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chamar no Zap</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onNewOrderForCustomer(deal.customer_name, deal.customer_phone, deal.customer_neighborhood);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Abrir novo pedido para este cliente"
                    >
                      <span>Novo Pedido</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            Fechar Radar
          </button>
        </div>

      </div>
    </div>
  );
};
