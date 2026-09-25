import React, { useState, useEffect } from 'react';
import { Deal, DealItem, FunnelStage, DeliveryType, PaymentMethod, DealSource } from '../types';
import { GROCERY_CATALOG, STAGES } from '../services/mockData';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Bike, 
  Store, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: Deal) => void;
  initialDeal?: Deal | null;
  defaultStage?: FunnelStage;
}

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDeal,
  defaultStage = 'lead',
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNeighborhood, setCustomerNeighborhood] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [stage, setStage] = useState<FunnelStage>(defaultStage);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [source, setSource] = useState<DealSource>('whatsapp');
  const [notes, setNotes] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [items, setItems] = useState<DealItem[]>([]);

  // Item input states
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnit, setItemUnit] = useState<'kg' | 'un' | 'pct' | 'cx' | 'lt'>('un');
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);

  useEffect(() => {
    if (initialDeal) {
      setCustomerName(initialDeal.customer_name);
      setCustomerPhone(initialDeal.customer_phone);
      setCustomerNeighborhood(initialDeal.customer_neighborhood);
      setCustomerAddress(initialDeal.customer_address || '');
      setStage(initialDeal.stage);
      setDeliveryType(initialDeal.delivery_type);
      setPaymentMethod(initialDeal.payment_method);
      setSource(initialDeal.source);
      setNotes(initialDeal.notes || '');
      setLostReason(initialDeal.lost_reason || '');
      setItems(initialDeal.items || []);
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerNeighborhood('');
      setCustomerAddress('');
      setStage(defaultStage);
      setDeliveryType('delivery');
      setPaymentMethod('pix');
      setSource('whatsapp');
      setNotes('');
      setLostReason('');
      setItems([]);
    }
  }, [initialDeal, defaultStage, isOpen]);

  if (!isOpen) return null;

  const handleSelectCatalogItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCatalogId(id);
    if (!id) return;

    const prod = GROCERY_CATALOG.find(p => p.id === id);
    if (prod) {
      setCustomItemName(prod.name);
      setItemUnitPrice(prod.price);
      setItemUnit(prod.default_unit);
      setItemQuantity(1);
    }
  };

  const handleAddItem = () => {
    const name = customItemName.trim();
    if (!name) return;

    const total = Math.round((itemQuantity * itemUnitPrice) * 100) / 100;
    const newItem: DealItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      quantity: itemQuantity,
      unit: itemUnit,
      unit_price: itemUnitPrice,
      total,
    };

    setItems([...items, newItem]);
    // Reset item inputs
    setSelectedCatalogId('');
    setCustomItemName('');
    setItemQuantity(1);
    setItemUnitPrice(0);
    setItemUnit('un');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  const calculatedTotal = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    const now = new Date().toISOString();
    const dealData: Deal = {
      id: initialDeal ? initialDeal.id : `deal-${Date.now()}`,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_neighborhood: customerNeighborhood.trim() || 'Balcão / Presencial',
      customer_address: customerAddress.trim(),
      stage,
      delivery_type: deliveryType,
      payment_method: paymentMethod,
      source,
      notes: notes.trim(),
      lost_reason: stage === 'lost' ? (lostReason.trim() || 'Desistência do cliente') : undefined,
      items,
      total_value: Math.round(calculatedTotal * 100) / 100,
      created_at: initialDeal ? initialDeal.created_at : now,
      updated_at: now,
    };

    onSave(dealData);
    onClose();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-stone-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {initialDeal ? 'Editar Pedido / Oportunidade' : 'Novo Pedido da Mercearia'}
            </h3>
            <p className="text-xs text-stone-500">
              Registre os dados do cliente, lista de compras e etapa do funil
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Dona Neide, Seu Antônio, Padaria do Zé"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                WhatsApp / Telefone *
              </label>
              <input
                type="text"
                placeholder="Ex: 11987654321"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Bairro da Mercearia
              </label>
              <input
                type="text"
                placeholder="Ex: Vila Esperança, Centro, Jardim Flores"
                value={customerNeighborhood}
                onChange={(e) => setCustomerNeighborhood(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Endereço Completo (para Delivery)
              </label>
              <input
                type="text"
                placeholder="Ex: Rua das Rosas, 100 - Apto 12"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Funnel Stage, Delivery & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Etapa do Funil
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as FunnelStage)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Tipo de Entrega
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="delivery">🛵 Delivery (Entrega a Domicílio)</option>
                <option value="pickup">🏪 Retirada no Balcão</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="caderneta_fiado">Caderneta / Fiado</option>
              </select>
            </div>
          </div>

          {/* Lost Reason if stage is lost */}
          {stage === 'lost' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
                Motivo da Perda / Desistência
              </label>
              <input
                type="text"
                placeholder="Ex: Preço alto, comprou no Atacadão, falta de estoque de produto, taxa de entrega"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-900"
              />
            </div>
          )}

          {/* Items Section */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                Itens da Mercearia & Cesta
              </label>
              <span className="text-xs text-stone-500">
                Selecione do catálogo ou digite item avulso
              </span>
            </div>

            {/* Quick Catalog / Add item row */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-500 block mb-0.5">
                    Sugestões do Catálogo:
                  </label>
                  <select
                    value={selectedCatalogId}
                    onChange={handleSelectCatalogItem}
                    className="w-full text-xs p-1.5 bg-white border border-stone-200 rounded-md"
                  >
                    <option value="">-- Escolha um produto da mercearia --</option>
                    {GROCERY_CATALOG.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatBRL(p.price)}/{p.default_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-500 block mb-0.5">
                    Nome do Item / Produto:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cesta Básica, Arroz 5kg, Ovos..."
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    className="w-full text-xs p-1.5 bg-white border border-stone-200 rounded-md"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-500 font-medium">Qtd:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseFloat(e.target.value) || 1)}
                    className="w-16 text-xs p-1.5 bg-white border border-stone-200 rounded-md text-center"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-500 font-medium">Un:</span>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value as any)}
                    className="text-xs p-1.5 bg-white border border-stone-200 rounded-md"
                  >
                    <option value="un">un</option>
                    <option value="kg">kg</option>
                    <option value="pct">pct</option>
                    <option value="cx">cx</option>
                    <option value="lt">lt</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-500 font-medium">Preço (R$):</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={itemUnitPrice || ''}
                    onChange={(e) => setItemUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-20 text-xs p-1.5 bg-white border border-stone-200 rounded-md text-right"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="ml-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Item
                </button>
              </div>
            </div>

            {/* Added items list */}
            {items.length > 0 ? (
              <div className="mt-3 border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between text-xs bg-white hover:bg-stone-50">
                    <div className="flex-1">
                      <span className="font-semibold text-stone-800">{item.name}</span>
                      <span className="text-stone-500 ml-2 font-mono">
                        {item.quantity} {item.unit} x {formatBRL(item.unit_price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-900 font-mono">
                        {formatBRL(item.total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal row */}
                <div className="p-3 bg-stone-50 flex items-center justify-between text-sm font-bold text-stone-900">
                  <span>Valor Total dos Produtos:</span>
                  <span className="text-emerald-700 text-base">{formatBRL(calculatedTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-center py-4 text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                Nenhum produto adicionado. Você pode salvar mesmo assim ou adicionar os itens do cliente.
              </div>
            )}
          </div>

          {/* Notes & Observation */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Observações da Mercearia (Horário de entrega, troco, preferências)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Entregar após as 18h; Levar máquina de cartão; Gosta de tomate mais maduro; Anotar no caderno"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialDeal ? 'Salvar Alterações' : 'Criar Pedido no Funil'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
