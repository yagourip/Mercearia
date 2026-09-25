import React from 'react';
import { Deal, FunnelStage } from '../types';
import { 
  Phone, 
  MapPin, 
  Bike, 
  Store, 
  CreditCard, 
  Banknote, 
  QrCode, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Edit3, 
  Trash2,
  Calendar,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMoveStage: (id: string, newStage: FunnelStage) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onEdit,
  onDelete,
  onMoveStage,
}) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'pix':
        return <QrCode className="w-3 h-3 text-emerald-600" />;
      case 'dinheiro':
        return <Banknote className="w-3 h-3 text-green-700" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="w-3 h-3 text-blue-600" />;
      case 'caderneta_fiado':
        return <BookOpen className="w-3 h-3 text-amber-700" />;
      default:
        return <CreditCard className="w-3 h-3 text-stone-500" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'Pix';
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão Crédito';
      case 'cartao_debito': return 'Cartão Débito';
      case 'caderneta_fiado': return 'Caderneta';
      default: return method;
    }
  };

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    const stageFlow: FunnelStage[] = ['lead', 'contacted', 'proposal', 'won', 'loyalty'];
    const currentIdx = stageFlow.indexOf(deal.stage);
    if (currentIdx >= 0 && currentIdx < stageFlow.length - 1) {
      const nextStage = stageFlow[currentIdx + 1];
      if (nextStage === 'won') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
      onMoveStage(deal.id, nextStage);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    const stageFlow: FunnelStage[] = ['lead', 'contacted', 'proposal', 'won', 'loyalty'];
    const currentIdx = stageFlow.indexOf(deal.stage);
    if (currentIdx > 0) {
      onMoveStage(deal.id, stageFlow[currentIdx - 1]);
    }
  };

  const handleDirectWon = (e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
    onMoveStage(deal.id, 'won');
  };

  const handleDirectLost = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveStage(deal.id, 'lost');
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = deal.customer_phone.replace(/\D/g, '');
    if (!cleanPhone) return;

    // Monta texto personalizado da mercearia
    let text = `Olá ${deal.customer_name}! Aqui é da Mercearia & Hortifruti. `;
    if (deal.stage === 'lead' || deal.stage === 'contacted') {
      text += `Segue nosso catálogo de ofertas e feira da semana! Podemos separar seu pedido?`;
    } else if (deal.stage === 'proposal') {
      text += `Seu pedido no valor de ${formatBRL(deal.total_value)} está conferido! Confirmamos o envio (${deal.delivery_type === 'delivery' ? 'Entrega em ' + deal.customer_neighborhood : 'Retirada no Balcão'})?`;
    } else if (deal.stage === 'won') {
      text += `Seu pedido de ${formatBRL(deal.total_value)} foi registrado com sucesso! Obrigado pela preferência!`;
    } else {
      text += `Temos novidades e produtos fresquinhos na mercearia hoje!`;
    }

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div
      onClick={() => onEdit(deal)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', deal.id);
      }}
      className="group bg-white rounded-xl border border-stone-200/90 hover:border-emerald-400 hover:shadow-md transition-all p-3.5 cursor-pointer relative flex flex-col justify-between select-none"
    >
      {/* Top Header: Customer Name & Actions */}
      <div>
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-emerald-700 transition-colors">
              {deal.customer_name}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{deal.customer_neighborhood || 'Balcão / Presencial'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            <button
              onClick={handleOpenWhatsApp}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
              title="Conversar no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(deal);
              }}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
              title="Editar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Deseja excluir o pedido de ${deal.customer_name}?`)) {
                  onDelete(deal.id);
                }
              }}
              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Badges: Delivery & Payment */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {deal.delivery_type === 'delivery' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Bike className="w-2.5 h-2.5" />
              Delivery
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Store className="w-2.5 h-2.5" />
              Balcão
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
            {getPaymentIcon(deal.payment_method)}
            {getPaymentLabel(deal.payment_method)}
          </span>

          {deal.source && (
            <span className="text-[10px] text-stone-400 font-mono">
              #{deal.source}
            </span>
          )}
        </div>

        {/* Items summary */}
        {deal.items && deal.items.length > 0 ? (
          <div className="mt-2.5 pt-2 border-t border-stone-100">
            <div className="text-[11px] text-stone-600 line-clamp-2">
              {deal.items.map(it => `${it.quantity}${it.unit} ${it.name}`).join(', ')}
            </div>
            {deal.items.length > 2 && (
              <span className="text-[10px] text-stone-400">
                ({deal.items.length} itens no total)
              </span>
            )}
          </div>
        ) : (
          <div className="mt-2 text-[11px] italic text-stone-400">
            Sem itens adicionados ainda
          </div>
        )}

        {/* Notes snippet */}
        {deal.notes && (
          <div className="mt-2 p-1.5 rounded bg-stone-50 text-[11px] text-stone-600 line-clamp-1 border border-stone-100">
            "{deal.notes}"
          </div>
        )}

        {/* Lost Reason if in lost stage */}
        {deal.stage === 'lost' && deal.lost_reason && (
          <div className="mt-2 p-1.5 rounded bg-rose-50 text-[11px] text-rose-700 border border-rose-100">
            <strong>Motivo:</strong> {deal.lost_reason}
          </div>
        )}
      </div>

      {/* Bottom Footer: Total Value & Transition Quick Buttons */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Total</span>
          <span className="text-sm font-bold text-stone-900">
            {formatBRL(deal.total_value)}
          </span>
        </div>

        {/* Stage advancement controls */}
        <div className="flex items-center gap-1">
          {deal.stage !== 'lead' && deal.stage !== 'lost' && (
            <button
              onClick={handlePrevious}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded text-xs transition-colors"
              title="Voltar etapa"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {deal.stage !== 'won' && deal.stage !== 'loyalty' && deal.stage !== 'lost' && (
            <>
              <button
                onClick={handleDirectWon}
                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[11px] font-semibold flex items-center gap-0.5 transition-colors"
                title="Concluir Venda (Ganho)"
              >
                <Check className="w-3 h-3" />
                <span>Vendido</span>
              </button>
              <button
                onClick={handleAdvance}
                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded text-xs transition-colors"
                title="Avançar para próxima etapa"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {deal.stage === 'won' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveStage(deal.id, 'loyalty');
              }}
              className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Mover para Recompra Recorrente"
            >
              <span>Fidelizar</span>
            </button>
          )}

          {deal.stage !== 'lost' && deal.stage !== 'won' && deal.stage !== 'loyalty' && (
            <button
              onClick={handleDirectLost}
              className="p-1 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Marcar como Perdido"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
