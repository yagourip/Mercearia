import React from 'react';
import { Deal } from '../types';
import { STAGES } from '../services/mockData';
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Download, 
  ShoppingBag, 
  Bike, 
  Store, 
  CreditCard,
  MapPin
} from 'lucide-react';

interface AnalyticsViewProps {
  deals: Deal[];
  onBackToKanban: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  deals,
  onBackToKanban,
}) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Funnel Stage Statistics
  const stageStats = STAGES.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage.id);
    const totalVal = stageDeals.reduce((sum, d) => sum + (Number(d.total_value) || 0), 0);
    return {
      ...stage,
      count: stageDeals.length,
      totalVal,
    };
  });

  const totalDealsCount = deals.length || 1;

  // Payment Breakdown
  const paymentStats = [
    { id: 'pix', label: 'Pix', count: 0, val: 0, color: 'bg-emerald-500' },
    { id: 'dinheiro', label: 'Dinheiro', count: 0, val: 0, color: 'bg-green-600' },
    { id: 'cartao_credito', label: 'Cartão Crédito', count: 0, val: 0, color: 'bg-blue-500' },
    { id: 'cartao_debito', label: 'Cartão Débito', count: 0, val: 0, color: 'bg-sky-500' },
    { id: 'caderneta_fiado', label: 'Caderneta / Fiado', count: 0, val: 0, color: 'bg-amber-500' },
  ];

  deals.forEach(d => {
    const st = paymentStats.find(p => p.id === d.payment_method);
    if (st) {
      st.count += 1;
      st.val += Number(d.total_value) || 0;
    }
  });

  // Top Products Demanded
  const productMap = new Map<string, { count: number; totalRev: number; unit: string }>();
  deals.forEach(d => {
    d.items?.forEach(it => {
      const existing = productMap.get(it.name);
      if (!existing) {
        productMap.set(it.name, { count: it.quantity, totalRev: it.total, unit: it.unit });
      } else {
        existing.count += it.quantity;
        existing.totalRev += it.total;
      }
    });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalRev - a.totalRev)
    .slice(0, 7);

  // Top Neighborhoods
  const neighborhoodMap = new Map<string, { count: number; val: number }>();
  deals.forEach(d => {
    const nb = d.customer_neighborhood || 'Balcão / Presencial';
    const ex = neighborhoodMap.get(nb);
    if (!ex) {
      neighborhoodMap.set(nb, { count: 1, val: Number(d.total_value) || 0 });
    } else {
      ex.count += 1;
      ex.val += Number(d.total_value) || 0;
    }
  });

  const topNeighborhoods = Array.from(neighborhoodMap.entries())
    .map(([neighborhood, data]) => ({ neighborhood, ...data }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 5);

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Cliente',
      'Telefone',
      'Bairro',
      'Etapa',
      'Valor Total',
      'Tipo Entrega',
      'Pagamento',
      'Itens',
      'Data Criacao',
    ];

    const rows = deals.map(d => [
      d.id,
      `"${d.customer_name.replace(/"/g, '""')}"`,
      d.customer_phone,
      `"${d.customer_neighborhood.replace(/"/g, '""')}"`,
      d.stage,
      d.total_value,
      d.delivery_type,
      d.payment_method,
      `"${(d.items || []).map(i => `${i.quantity}${i.unit} ${i.name}`).join('; ')}"`,
      d.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `funil_mercearia_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            Relatório Comercial & Análise do Funil da Mercearia
          </h2>
          <p className="text-xs text-stone-500">
            Entenda o volume de pedidos, taxa de conversão, formas de pagamento e produtos mais vendidos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onBackToKanban}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Voltar ao Funil Kanban
          </button>
        </div>
      </div>

      {/* Visual Funnel Drop-off */}
      <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Conversão Etapa por Etapa no Funil
        </h3>

        <div className="space-y-3">
          {stageStats.map((st) => {
            const percentage = Math.round((st.count / totalDealsCount) * 100);
            return (
              <div key={st.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">{st.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500">{st.count} pedidos ({percentage}%)</span>
                    <span className="font-bold text-stone-900 font-mono w-24 text-right">
                      {formatBRL(st.totalVal)}
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      st.id === 'won' ? 'bg-emerald-500' :
                      st.id === 'loyalty' ? 'bg-purple-500' :
                      st.id === 'lost' ? 'bg-rose-400' :
                      st.id === 'proposal' ? 'bg-indigo-500' :
                      st.id === 'contacted' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Payment Methods & Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Formas de Pagamento */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Distribuição por Forma de Pagamento
          </h3>

          <div className="space-y-3">
            {paymentStats.map(p => {
              const totalRevenue = deals.reduce((sum, d) => sum + (Number(d.total_value) || 0), 0) || 1;
              const revPercent = Math.round((p.val / totalRevenue) * 100);
              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-800">{p.label}</span>
                    <div className="flex items-center gap-3 text-stone-500">
                      <span>{p.count} compras</span>
                      <span className="font-bold text-stone-900 font-mono">
                        {formatBRL(p.val)} ({revPercent}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.color}`}
                      style={{ width: `${revPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Produtos Mais Demandados */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            Produtos Mais Vendidos / Solicitados
          </h3>

          {topProducts.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {topProducts.map((prod, idx) => (
                <div key={prod.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-stone-900">{prod.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 font-mono">
                      {prod.count} {prod.unit}
                    </span>
                    <span className="font-bold text-stone-900 font-mono">
                      {formatBRL(prod.totalRev)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-stone-400 py-6 text-center">
              Adicione itens aos pedidos para ver a lista de produtos mais vendidos.
            </div>
          )}
        </div>

      </div>

      {/* Top Neighborhoods Card */}
      <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-600" />
          Faturamento por Bairro Atendido
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topNeighborhoods.map(nb => (
            <div key={nb.neighborhood} className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
              <h5 className="text-xs font-bold text-stone-900 truncate mb-1">
                {nb.neighborhood}
              </h5>
              <div className="text-sm font-bold text-emerald-700">
                {formatBRL(nb.val)}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {nb.count} {nb.count === 1 ? 'pedido' : 'pedidos'}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
