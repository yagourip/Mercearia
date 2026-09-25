import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Send,
  Sparkles,
  ShoppingBasket,
  Bike,
  BookOpen
} from 'lucide-react';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [targetPhone, setTargetPhone] = useState('');

  if (!isOpen) return null;

  const templates = [
    {
      id: 'feira',
      title: '🥦 Quarta da Feira / Hortifruti Fresquinho',
      category: 'Atração & Vendas',
      text: `Olá vizinho(a)! 🌿🍎\n\nHoje é dia de feira fresca aqui na Mercearia & Hortifruti Bom Preço!\nAcabamos de descarregar:\n• Banana Prata e Nanica selecionadas\n• Tomate italiano bem vermelhinho\n• Batata Monalisa e Cebola nacional\n• Folhagens e temperos verdes\n\nEnvie sua lista de compras por aqui que separamos com todo o carinho e entregamos na sua porta! 🛵🛵`,
    },
    {
      id: 'confirmacao',
      title: '📋 Confirmação de Pedido & Chave Pix',
      category: 'Negociação & Fechamento',
      text: `Olá! Seu pedido na Mercearia já foi conferido e separado com sucesso! ✅\n\n💰 Valor Total: R$ [VALOR]\n🛵 Forma de Entrega: Entrega a Domicílio\n🔑 Chave Pix: mercearia@pix.com.br (ou pague com cartão/dinheiro na entrega)\n\nPodemos liberar o motoboy para entrega agora?`,
    },
    {
      id: 'despacho',
      title: '🛵 Saiu para Entrega (Com Troco/Maquininha)',
      category: 'Operacional & Entrega',
      text: `Boa notícia! 🚀 Seu pedido da mercearia acabou de sair para entrega com o nosso entregador.\nPrevisão de chegada: 15 a 25 minutos.\n\nQualquer dúvida estamos à disposição! Bom apetite e obrigado pela preferência! 🛒✨`,
    },
    {
      id: 'churrasco',
      title: '🥩 Kit Churrasco do Fim de Semana',
      category: 'Ativação de Fim de Semana',
      text: `O fim de semana chegou! 🥩🍻\nNa Mercearia você encontra tudo para seu churrasco em família:\n• Linguiça toscana e carnes selecionadas\n• Carvão 3kg de alta duração\n• Refrigerantes 2L bem gelados e cervejas\n• Farofa, temperos e pão de alho\n\nPeça já e não fique na mão no domingo! Entregamos rapidinho.`,
    },
    {
      id: 'fiado',
      title: '📒 Fechamento Amigável da Caderneta',
      category: 'Caderneta & Fiado',
      text: `Olá! Passando para enviar o extrato de compras da sua caderneta na mercearia deste mês.\n\nTotal acumulado: R$ [VALOR]\nVocê pode pagar via Pix pela chave mercearia@pix.com.br ou acertar direto no balcão quando passar por aqui.\n\nMuito obrigado pela confiança e amizade de sempre! 🙏`,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendDirect = (text: string) => {
    const clean = targetPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    if (clean) {
      window.open(`https://wa.me/55${clean}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Modelos Rápidos de WhatsApp da Mercearia
              </h3>
              <p className="text-xs text-emerald-200/80">
                Copie ou envie direto para clientes e grupos do bairro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Direct Phone Input */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-semibold text-stone-700 whitespace-nowrap">
              Telefone do Cliente (opcional):
            </span>
            <input
              type="text"
              placeholder="Ex: 11987654321 (ou deixe em branco para escolher no WhatsApp)"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              className="flex-1 w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Templates list */}
          <div className="space-y-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white border border-stone-200 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {tpl.category}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1">
                      {tpl.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(tpl.id, tpl.text)}
                      className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md flex items-center gap-1 transition-colors"
                      title="Copiar texto"
                    >
                      {copiedId === tpl.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendDirect(tpl.text)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1 shadow-xs transition-colors"
                      title="Abrir no WhatsApp"
                    >
                      <Send className="w-3 h-3" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-700 whitespace-pre-wrap font-sans border border-stone-100">
                  {tpl.text}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
