import React from 'react';
import { Deal } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Percent, 
  Bike, 
  Store,
  Users
} from 'lucide-react';

interface MetricsBarProps {
  deals: Deal[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ deals }) => {
  // Deals in progress (lead, contacted, proposal)
  const inPipelineDeals = deals.filter(d => ['lead', 'contacted', 'proposal'].includes(d.stage));
  const pipelineValue = inPipelineDeals.reduce((sum, d) => sum + (Number(d.total_value) || 0), 0);

  // Won & Loyalty deals (successful revenue)
  const wonDeals = deals.filter(d => ['won', 'loyalty'].includes(d.stage));
  const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.total_value) || 0), 0);

  // Conversion rate
  const totalDecided = deals.filter(d => ['won', 'loyalty', 'lost'].includes(d.stage)).length;
  const conversionRate = totalDecided > 0 
    ? Math.round((wonDeals.length / totalDecided) * 100) 
    : 0;

  // Average ticket of closed orders
  const averageTicket = wonDeals.length > 0 
    ? wonValue / wonDeals.length 
    : 0;

  // Delivery vs Pickup
  const deliveryCount = deals.filter(d => d.delivery_type === 'delivery').length;
  const pickupCount = deals.filter(d => d.delivery_type === 'pickup').length;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      
      {/* 1. Em Negociação / Funil Aberto */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">No Funil Ativo</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900">
            {formatBRL(pipelineValue)}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {inPipelineDeals.length} {inPipelineDeals.length === 1 ? 'pedido em cotação' : 'pedidos em cotação'}
          </div>
        </div>
      </div>

      {/* 2. Vendas Concluídas */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-emerald-800 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Concluído</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">
            {formatBRL(wonValue)}
          </div>
          <div className="text-xs text-emerald-600 mt-0.5 font-medium">
            {wonDeals.length} compras pagas e entregues
          </div>
        </div>
      </div>

      {/* 3. Ticket Médio da Mercearia */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Ticket Médio</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900">
            {formatBRL(averageTicket)}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            por cliente na mercearia
          </div>
        </div>
      </div>

      {/* 4. Taxa de Conversão */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Conversão de Venda</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-purple-900">
            {conversionRate}%
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            do contato à compra final
          </div>
        </div>
      </div>

      {/* 5. Modalidade de Atendimento */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Modalidade</span>
          <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-700">
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivery: <strong>{deliveryCount}</strong></span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center gap-1.5 text-xs text-stone-700">
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span>Balcão: <strong>{pickupCount}</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
};
