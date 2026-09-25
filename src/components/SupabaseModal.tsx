import React, { useState } from 'react';
import { SupabaseConfig } from '../types';
import { 
  testSupabaseConnection, 
  saveStoredSupabaseConfig, 
  SQL_SCHEMA_INSTRUCTIONS,
  syncAllLocalToSupabase
} from '../services/supabaseClient';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud,
  FileCode
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onConfigUpdated: (newConfig: SupabaseConfig) => void;
  onRefreshData: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  onRefreshData,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableExists: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSyncStatus(null);
    try {
      const res = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(res);

      if (res.success) {
        // Salva a configuração atual
        const updated = {
          url: url.trim(),
          anonKey: anonKey.trim(),
          isConnected: true,
          tableName: config.tableName,
        };
        saveStoredSupabaseConfig(updated);
        onConfigUpdated(updated);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Erro inesperado ao testar conexão',
        tableExists: false,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveOnly = () => {
    const isConn = Boolean(url.trim() && anonKey.trim());
    const updated = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: isConn,
      tableName: config.tableName,
    };
    saveStoredSupabaseConfig(updated);
    onConfigUpdated(updated);
    onRefreshData();
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_INSTRUCTIONS);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncAllLocalToSupabase();
      setSyncStatus(`Sucesso! ${res.count} pedidos foram sincronizados com o Supabase.`);
      onRefreshData();
    } catch (err: any) {
      setSyncStatus(`Erro ao enviar dados: ${err?.message || 'Falha na requisição'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    const updated = {
      url: '',
      anonKey: '',
      isConnected: false,
      tableName: config.tableName,
    };
    setUrl('');
    setAnonKey('');
    saveStoredSupabaseConfig(updated);
    onConfigUpdated(updated);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Conexão com Banco de Dados Supabase
              </h3>
              <p className="text-xs text-emerald-200/80">
                Armazenamento em nuvem em tempo real para os pedidos da mercearia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            config.isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {config.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <span className="font-bold block text-sm mb-0.5">
                {config.isConnected ? 'Supabase Conectado e Ativo' : 'Modo de Armazenamento Local Ativo'}
              </span>
              {config.isConnected ? (
                <p>Os pedidos e clientes do funil estão sendo sincronizados com sua nuvem Supabase.</p>
              ) : (
                <p>
                  O aplicativo está salvando os dados no navegador (LocalStorage). Para salvar na nuvem do Supabase, insira suas credenciais abaixo.
                </p>
              )}
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Supabase Project URL
                </label>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                >
                  Abrir Supabase Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                placeholder="https://sua-empresa-xyz.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Encontrado em <em>Project Settings &gt; API &gt; Project URL</em>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Supabase Anon Key (Public API Key)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Encontrado em <em>Project Settings &gt; API &gt; Project API keys &gt; anon public</em>
              </span>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão com Supabase'}</span>
              </button>

              {config.isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 border border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-stone-50 rounded-lg text-xs font-medium transition-colors"
                >
                  Desconectar
                </button>
              )}
            </div>

            {/* Test Connection Result */}
            {testResult && (
              <div className={`p-3 rounded-lg text-xs border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <strong>{testResult.success ? 'Conexão OK:' : 'Falha:'}</strong> {testResult.message}
              </div>
            )}
          </div>

          {/* SQL Editor Instructions */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  Script SQL para Criar Tabela no Supabase
                </h4>
                <p className="text-[11px] text-stone-500">
                  Rode este comando no <strong>SQL Editor</strong> do seu Supabase para criar a tabela de pedidos
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-stone-800">
              <code>{SQL_SCHEMA_INSTRUCTIONS}</code>
            </pre>
          </div>

          {/* Sync Local Deals to Supabase */}
          <div className="pt-4 border-t border-stone-200 bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-stone-800">
                Migrar Pedidos Locais para o Supabase
              </h5>
              <p className="text-[11px] text-stone-500">
                Envia todos os pedidos cadastrados atualmente para a tabela remota do Supabase.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={isSyncing || !config.isConnected}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Sincronizando...' : 'Enviar para o Supabase'}</span>
            </button>
          </div>

          {syncStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              {syncStatus}
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSaveOnly}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            Salvar Configurações
          </button>
        </div>

      </div>
    </div>
  );
};
