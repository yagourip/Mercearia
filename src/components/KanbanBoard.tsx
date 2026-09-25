import React, { useState } from 'react';
import { Deal, FunnelStage } from '../types';
import { STAGES } from '../services/mockData';
import { DealCard } from './DealCard';
import { 
  Search, 
  Filter, 
  Plus, 
  Bike, 
  Store, 
  Sparkles, 
  ShoppingCart, 
  FileText, 
  CheckCircle2, 
  Repeat, 
  XCircle,
  X
} from 'lucide-react';

interface KanbanBoardProps {
  deals: Deal[];
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
  onMoveStage: (id: string, newStage: FunnelStage) => void;
  onQuickNewDeal: (stage?: FunnelStage) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  deals,
  onEditDeal,
  onDeleteDeal,
  onMoveStage,
  onQuickNewDeal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [draggingOverStage, setDraggingOverStage] = useState<FunnelStage | null>(null);

  // Extract unique neighborhoods for filtering
  const neighborhoods = Array.from(new Set(deals.map(d => d.customer_neighborhood).filter(Boolean)));

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = deal.customer_name.toLowerCase().includes(term);
      const matchPhone = deal.customer_phone.includes(term);
      const matchNeighborhood = deal.customer_neighborhood.toLowerCase().includes(term);
      const matchItems = deal.items?.some(it => it.name.toLowerCase().includes(term));
      const matchNotes = deal.notes?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchNeighborhood && !matchItems && !matchNotes) {
        return false;
      }
    }

    // Neighborhood
    if (neighborhoodFilter !== 'all' && deal.customer_neighborhood !== neighborhoodFilter) {
      return false;
    }

    // Delivery Type
    if (deliveryFilter !== 'all' && deal.delivery_type !== deliveryFilter) {
      return false;
    }

    // Payment
    if (paymentFilter !== 'all' && deal.payment_method !== paymentFilter) {
      return false;
    }

    return true;
  });

  const getStageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'ShoppingCart': return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case 'FileText': return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Repeat': return <Repeat className="w-4 h-4 text-purple-600" />;
      case 'XCircle': return <XCircle className="w-4 h-4 text-rose-600" />;
      default: return null;
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleDragOver = (e: React.DragEvent, stageId: FunnelStage) => {
    e.preventDefault();
    if (draggingOverStage !== stageId) {
      setDraggingOverStage(stageId);
    }
  };

  const handleDragLeave = () => {
    setDraggingOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: FunnelStage) => {
    e.preventDefault();
    setDraggingOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      onMoveStage(dealId, targetStage);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setNeighborhoodFilter('all');
    setDeliveryFilter('all');
    setPaymentFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || neighborhoodFilter !== 'all' || deliveryFilter !== 'all' || paymentFilter !== 'all';

  return (
    <div className="flex flex-col gap-4">
      
      {/* Search and Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, produto, telefone ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Neighborhood filter */}
          <select
            value={neighborhoodFilter}
            onChange={(e) => setNeighborhoodFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos os Bairros</option>
            {neighborhoods.map(nb => (
              <option key={nb} value={nb}>{nb}</option>
            ))}
          </select>

          {/* Delivery Type filter */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
            <button
              onClick={() => setDeliveryFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                deliveryFilter === 'all' ? 'bg-white shadow-xs font-semibold text-stone-900' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setDeliveryFilter('delivery')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                deliveryFilter === 'delivery' ? 'bg-white shadow-xs font-semibold text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bike className="w-3 h-3 text-emerald-600" />
              Delivery
            </button>
            <button
              onClick={() => setDeliveryFilter('pickup')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                deliveryFilter === 'pickup' ? 'bg-white shadow-xs font-semibold text-amber-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Store className="w-3 h-3 text-amber-600" />
              Balcão
            </button>
          </div>

          {/* Payment Method filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas as Formas de Pagamento</option>
            <option value="pix">Pix</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="caderneta_fiado">Caderneta / Fiado</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 hover:bg-rose-50 rounded"
            >
              <X className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Counter indicator */}
        <div className="text-xs text-stone-500 font-medium">
          Exibindo <strong>{filteredDeals.length}</strong> de <strong>{deals.length}</strong> pedidos
        </div>
      </div>

      {/* Kanban Columns Overflow Horizontal Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.total_value) || 0), 0);
          const isOver = draggingOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex flex-col rounded-xl bg-stone-100/70 border transition-all min-h-[500px] ${
                isOver 
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400 ring-opacity-50' 
                  : `${stage.borderLight} border-opacity-70`
              }`}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-xl bg-white border-b ${stage.borderLight} flex flex-col gap-1`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getStageIcon(stage.icon)}
                    <h3 className="text-xs font-bold text-stone-800 leading-tight">
                      {stage.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span className="font-semibold text-stone-900">
                    {formatBRL(stageTotal)}
                  </span>
                  <button
                    onClick={() => onQuickNewDeal(stage.id)}
                    className="p-1 hover:bg-stone-100 text-stone-500 hover:text-emerald-700 rounded transition-colors"
                    title={`Adicionar pedido em ${stage.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="p-2 flex flex-col gap-2.5 flex-1">
                {stageDeals.length > 0 ? (
                  stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onEdit={onEditDeal}
                      onDelete={onDeleteDeal}
                      onMoveStage={onMoveStage}
                    />
                  ))
                ) : (
                  <div className="h-32 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-xs text-stone-400">
                      Nenhum pedido aqui
                    </span>
                    <button
                      onClick={() => onQuickNewDeal(stage.id)}
                      className="mt-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
