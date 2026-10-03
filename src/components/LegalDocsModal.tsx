import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  BookOpen,
  DollarSign,
  Scale,
  CheckCircle,
  Award,
  Layers,
  Sparkles,
  Lock,
  ChevronRight,
  ExternalLink,
  Store,
  User,
  Bike,
} from 'lucide-react';

export type LegalDocType =
  | 'manual-cliente'
  | 'manual-lojista'
  | 'planos-taxas'
  | 'lgpd'
  | 'termos'
  | 'avaliacoes'
  | 'direitos';

interface LegalDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
  onNavigateToTab?: (tab: string) => void;
  onOpenOnboarding?: (type?: 'merchant' | 'driver') => void;
}

export const LegalDocsModal: React.FC<LegalDocsModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'manual-cliente',
  onNavigateToTab,
  onOpenOnboarding,
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                  Documentação Oficial & Transparência
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-200">
                  Bex Serviços e Comércios
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-['Space_Grotesk'] text-white">
                AcheiaKi — Cachoeiras de Macacu
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-neutral-100/90 border-b border-neutral-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveDoc('manual-cliente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeDoc === 'manual-cliente'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Manual do Cliente</span>
          </button>

          <button
            onClick={() => setActiveDoc('manual-lojista')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeDoc === 'manual-lojista'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Manual do Lojista</span>
          </button>

          <button
            onClick={() => setActiveDoc('planos-taxas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeDoc === 'planos-taxas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Planos & Taxas</span>
          </button>

          <button
            onClick={() => setActiveDoc('lgpd')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeDoc === 'lgpd'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacidade & LGPD</span>
          </button>

          <button
            onClick={() => setActiveDoc('termos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeDoc === 'termos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Termos de Uso</span>
          </button>

          <button
            onClick={() => setActiveDoc('avaliacoes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeDoc === 'avaliacoes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Avaliações Mútuas</span>
          </button>

          <button
            onClick={() => setActiveDoc('direitos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeDoc === 'direitos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Direitos Autorais (Bex)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-neutral-800 text-sm leading-relaxed">
          {/* 1. MANUAL DO CLIENTE */}
          {activeDoc === 'manual-cliente' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Guia Prático do Consumidor
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Manual Passo a Passo do Cliente — AcheiaKi
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Como pesquisar estabelecimentos, adicionar ao carrinho, solicitar serviços e acompanhar entregas em Cachoeiras de Macacu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Explorando Lojas & Bairros</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Navegue por categorias como Padarias, Supermercados, Farmácias e Pet Shops no Centro, Japuíba, Papucaia e Serra. Utilize a busca rápida para achar produtos específicos.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Carrinho & Personalização</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Selecione quantidades e observações especiais. Você pode agrupar produtos da mesma loja com taxa de entrega fixa de R$ 5,00 padrão na área urbana.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>Pagamento Seguro & Rastreamento</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Pague via PIX instantâneo, Cartão de Crédito ou na Entrega. Acompanhe as etapas: Pedido Recebido, Em Preparo, Pronto, Motoboy a Caminho e Entregue.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                      4
                    </span>
                    <span>Avaliação Mútua & Chat Local</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Converse diretamente com o comerciante ou entregador pelo chat do aplicativo e avalie com 1 a 5 estrelas para incentivar o bom atendimento local.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Pronto para comprar no comércio local?</h4>
                  <p className="text-[11px] text-emerald-800">Encontre os melhores comércios de Cachoeiras de Macacu agora mesmo.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToTab) onNavigateToTab('home');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Ir para a Home
                </button>
              </div>
            </div>
          )}

          {/* 2. MANUAL DO LOJISTA */}
          {activeDoc === 'manual-lojista' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Gestão & Vendas Locais
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Manual Passo a Passo do Lojista — AcheiaKi
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Controle total da sua vitrine virtual, catálogo de produtos, valores, pedidos e analytics com a biblioteca D3.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-xs mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    1. Cadastro & Geração de Senha Temporária
                  </h4>
                  <p className="text-xs text-neutral-600">
                    O lojista cadastra Razão Social, Nome Fantasia, CNPJ, Telefone e Endereço. Uma senha temporária segura de 6 caracteres é gerada automaticamente. No primeiro login, o sistema solicita a alteração para a senha definitiva pessoal do lojista.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-xs mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    2. Inserção de Produtos, Fotos, Preços & Estoque (Autonomia Total)
                  </h4>
                  <p className="text-xs text-neutral-600">
                    No <strong>Portal do Lojista</strong>, acesse a aba <em>Catálogo de Produtos</em> para cadastrar quantos itens desejar, definir preços normais e promocionais, código SKU, fotos em alta resolução, descrições detalhadas e disponibilidade de estoque.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-xs mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    3. Fluxo de Atendimento de Pedidos
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Receba notificações em tempo real quando um morador fizer uma compra. Avance os status com 1 clique: <em>Em Preparo</em> ➔ <em>Pronto para Retirada</em> ➔ <em>Motoboy Vinculado</em> ➔ <em>Entregue</em>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <h4 className="font-bold text-neutral-900 text-xs mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    4. Dashboards Analíticos D3.js & Repasses Financeiros
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Consulte relatórios visuais com gráficos D3 interativos de desempenho por período (7 dias, 30 dias ou 12 meses) e faturamento por categoria de produto. Todos os repasses líquidos são discriminados de forma 100% transparente.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Ainda não cadastrou seu comércio?</h4>
                  <p className="text-[11px] text-emerald-800">Cadastre-se gratuitamente e comece a vender hoje mesmo.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenOnboarding) onOpenOnboarding('merchant');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Cadastrar Loja Agora
                </button>
              </div>
            </div>
          )}

          {/* 3. PLANOS & TAXAS */}
          {activeDoc === 'planos-taxas' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Preços Transparentes & Planos SaaS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Tabela Oficial de Planos & Taxas de Intermediação
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Modelo SaaS justo, sem taxas abusivas e com controle e previsibilidade financeira para o comerciante de Cachoeiras de Macacu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Plano Grátis / Bronze */}
                <div className="p-5 rounded-3xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                      Plano Grátis / Bronze
                    </span>
                    <h4 className="text-lg font-black text-neutral-900">Início Rápido</h4>
                    <p className="text-2xl font-black text-neutral-900">
                      R$ 0,00 <span className="text-xs font-normal text-neutral-500">/mês</span>
                    </p>
                    <p className="text-xs text-neutral-500">Para pequenos produtores e artesãos locais.</p>
                    <ul className="text-xs space-y-1.5 pt-2 text-neutral-600">
                      <li>✓ Até 15 produtos cadastrados</li>
                      <li>✓ Taxa de 12% por pedido faturado</li>
                      <li>✓ Notificações de pedidos no app</li>
                      <li>✓ Suporte via comunidade local</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenOnboarding) onOpenOnboarding('merchant');
                    }}
                    className="w-full py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-bold text-xs rounded-xl transition"
                  >
                    Começar Grátis
                  </button>
                </div>

                {/* Plano Prata / Ouro (Destaque) */}
                <div className="p-5 rounded-3xl bg-emerald-950 text-white border-2 border-emerald-500 flex flex-col justify-between space-y-4 relative shadow-xl">
                  <div className="absolute -top-3 right-4 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    Mais Popular
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200">
                      Plano Ouro (SaaS Pro)
                    </span>
                    <h4 className="text-lg font-black text-white">Comércio em Crescimento</h4>
                    <p className="text-2xl font-black text-emerald-400">
                      R$ 49,90 <span className="text-xs font-normal text-emerald-200">/mês</span>
                    </p>
                    <p className="text-xs text-neutral-300">Para padarias, mercados, lanchonetes e lojas estabelecidas.</p>
                    <ul className="text-xs space-y-1.5 pt-2 text-emerald-100">
                      <li>✓ Produtos ilimitados no catálogo</li>
                      <li>✓ Taxa reduzida de apenas 8% por venda</li>
                      <li>✓ Dashboards Analíticos D3.js</li>
                      <li>✓ Destaque na página inicial e buscas</li>
                      <li>✓ Suporte prioritário via WhatsApp</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenOnboarding) onOpenOnboarding('merchant');
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs rounded-xl shadow-md transition"
                  >
                    Aderir ao Plano Ouro
                  </button>
                </div>

                {/* Plano Premium Corporativo */}
                <div className="p-5 rounded-3xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Plano Premium VIP
                    </span>
                    <h4 className="text-lg font-black text-neutral-900">Redes & Grandes Lojas</h4>
                    <p className="text-2xl font-black text-neutral-900">
                      R$ 99,90 <span className="text-xs font-normal text-neutral-500">/mês</span>
                    </p>
                    <p className="text-xs text-neutral-500">Para redes de drogarias, supermercados e atacadistas.</p>
                    <ul className="text-xs space-y-1.5 pt-2 text-neutral-600">
                      <li>✓ Taxa mínima de apenas 5% por venda</li>
                      <li>✓ Banners publicitários inclusos</li>
                      <li>✓ Integração multi-unidades</li>
                      <li>✓ Gerente de conta dedicado Bex</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenOnboarding) onOpenOnboarding('merchant');
                    }}
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    Falar com Consultor
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRIVACIDADE & LGPD */}
          {activeDoc === 'lgpd' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Política de Privacidade & Proteção de Dados (LGPD)
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Compromisso formal da <strong>Bex Serviços e Comércios</strong> (CNPJ 30.810.800/0001-39) com a transparência e sigilo das informações.
                </p>
              </div>

              <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">1. Coleta e Finalidade dos Dados</h4>
                  <p>
                    A plataforma AcheiaKi coleta apenas os dados estritamente necessários para viabilizar as transações comerciais entre clientes, lojistas e entregadores parceiros em Cachoeiras de Macacu: nome completo, telefone, e-mail, CPF/CNPJ, endereços de entrega e geolocalização durante entregas ativas.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">2. Registro de Consentimento e Auditoria</h4>
                  <p>
                    Em estrita conformidade com a LGPD, todo cadastro de lojista, entregador ou usuário armazena o campo auditável <code>acceptedTermsAt</code> com timestamp ISO, dados de navegador, IP aproximado e declaração de ciência expressa arquivada no Firestore.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">3. Direitos do Titular dos Dados</h4>
                  <p>
                    O usuário tem direito a consultar, atualizar, retificar ou solicitar a exclusão de seus dados a qualquer momento, mediante requisição direta ao encarregado de dados (DPO) através do canal oficial da Bex Serviços e Comércios: <code>contato@bexservicos.com.br</code>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">4. Não Comercialização de Dados</h4>
                  <p>
                    A Bex Serviços e Comércios não vende, aluga nem repassa dados cadastrais de consumidores ou comerciantes a empresas de publicidade externas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. TERMOS DE USO & REGRAS COMERCIAIS */}
          {activeDoc === 'termos' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Condições Gerais de Contratação
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Termos de Uso & Regras Comerciais da Plataforma
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Direitos, obrigações e parâmetros operacionais para comércio eletrônico em Cachoeiras de Macacu.
                </p>
              </div>

              <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">1. Natureza da Plataforma</h4>
                  <p>
                    O AcheiaKi atua exclusivamente como plataforma de intermediação e aproximação tecnológica (SaaS) desenvolvida pela Bex Serviços e Comércios, conectando estabelecimentos comerciais locais, prestadores de serviços, entregadores autônomos e consumidores finais.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">2. Responsabilidade pelos Produtos & Preços</h4>
                  <p>
                    Cada lojista cadastrado detém gestão exclusiva sobre a inserção, descrição, fotos, validade, preços e qualidade dos produtos ofertados em seu catálogo virtual, respondendo perante o Código de Defesa do Consumidor.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">3. Cancelamentos e Estornos</h4>
                  <p>
                    Cancelamentos solicitados antes do despacho do pedido serão reembolsados integralmente. Caso o pedido já esteja em trânsito com motoboy, a taxa de deslocamento poderá ser retida para remunerar o entregador parceiro.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. POLÍTICA DE AVALIAÇÕES MÚTUAS */}
          {activeDoc === 'avaliacoes' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Transparência e Confiança Comunitária
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Política de Avaliações Mútuas
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Como funciona a pontuação de 1 a 5 estrelas e feedbacks entre clientes, lojistas e motoboys.
                </p>
              </div>

              <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
                <p>
                  Para preservar a qualidade do ecossistema comercial de Cachoeiras de Macacu, o AcheiaKi adota um sistema de avaliação bidirecional:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <span className="text-xs font-bold text-neutral-900 block mb-1">⭐ Cliente avalia a Loja</span>
                    <span className="text-[11px] text-neutral-500">Qualidade dos itens, embalagem, fidelidade ao anunciado e tempo de preparo.</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <span className="text-xs font-bold text-neutral-900 block mb-1">⭐ Cliente avalia o Entregador</span>
                    <span className="text-[11px] text-neutral-500">Cordialidade, agilidade e cuidado no transporte da encomenda.</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <span className="text-xs font-bold text-neutral-900 block mb-1">⭐ Entregador avalia a Entrega</span>
                    <span className="text-[11px] text-neutral-500">Clareza do endereço, receptividade e segurança no ponto de entrega.</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 italic">
                  * Avaliações contendo conteúdo ofensivo, discriminatório ou fraudulento são moderadas e removidas pela equipe de governança Master.
                </p>
              </div>
            </div>
          )}

          {/* 7. DIREITOS AUTORAIS (BEX) */}
          {activeDoc === 'direitos' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Propriedade Intelectual & Titularidade
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Direitos Autorais & Autoria da Plataforma
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Registro de autoria, marcas, código-fonte e infraestrutura tecnológica.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Bex Serviços e Comércios</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  A plataforma <strong>AcheiaKi</strong> (com o subtítulo &ldquo;Cachoeiras de Macacu&rdquo;), suas interfaces, código-fonte em React, TypeScript e regras de segurança Firestore são de titularidade e autoria exclusiva da <strong>Bex Serviços e Comércios</strong>, inscrita no CNPJ sob o nº <strong>30.810.800/0001-39</strong>.
                </p>
                <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex flex-wrap gap-x-6 gap-y-1">
                  <span>© 2026 Achei Aqui / AcheiaKi - Cachoeiras de Macacu - RJ</span>
                  <span>CNPJ: 30.810.800/0001-39</span>
                  <span>Todos os direitos reservados.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex items-center justify-between shrink-0 text-xs">
          <span className="text-neutral-500 text-[11px]">
            © 2026 Achei Aqui - Cachoeiras de Macacu - RJ • Bex Serviços e Comércios
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
