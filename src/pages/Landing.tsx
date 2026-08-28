// src/pages/Landing.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Link adicionado aqui
import {
  Calculator,
  TrendingUp,
  PieChart,
  FileText,
  ChefHat,
  ShoppingCart,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Star,
  Menu,
  X,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Check
} from 'lucide-react';

// ============================================================================
// DADOS ESTÁTICOS (Facilita manutenção e atualização de preços/textos)
// ============================================================================

const DIFFERENTIATORS = [
  {
    icon: MessageCircle,
    title: 'Automação via WhatsApp',
    desc: 'Envie comprovantes de venda automaticamente para o cliente após o fechamento, usando nossa integração com Evolution API.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: MapPin,
    title: 'Frete Dinâmico Real',
    desc: 'Cálculo de frete preciso baseado em geolocalização (OpenRouteService), eliminando achismos e prejuízos na entrega.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Calculator,
    title: 'Precificação Inteligente',
    desc: 'Saiba exatamente o custo de cada receita, margem de lucro e preço de venda sugerido, ingrediente por ingrediente.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança e LGPD',
    desc: 'Isolamento total de dados por usuário (userId). Seus dados e os de seus clientes estão criptografados e seguros.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  }
];

const PLANS = [
  {
    name: 'Free',
    price: '0',
    description: 'Para quem está começando e quer organizar as finanças.',
    features: ['Até 10 vendas/mês', 'Até 5 clientes', 'Até 5 receitas', 'Dashboard básico'],
    cta: 'Começar Grátis',
    highlighted: false,
  },
  {
    name: 'Basic',
    price: '49,90',
    description: 'Para pequenos negócios que precisam de mais controle.',
    features: ['Até 100 vendas/mês', 'Até 50 clientes', 'Até 30 receitas', 'Precificação de receitas', 'Relatórios PDF/Excel'],
    cta: 'Assinar Basic',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '99,90',
    description: 'O plano mais escolhido para escalar com automação.',
    features: ['Vendas ilimitadas', 'Clientes ilimitados', 'Receitas ilimitadas', 'Envio de comprovantes via WhatsApp', 'Cálculo de frete dinâmico', 'Relatórios avançados'],
    cta: 'Assinar Pro (Recomendado)',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '199,90',
    description: 'Para operações que exigem suporte e recursos máximos.',
    features: ['Tudo do plano Pro', 'Suporte prioritário', 'Múltiplos usuários (em breve)', 'API de integração dedicada', 'Backup diário garantido'],
    cta: 'Assinar Premium',
    highlighted: false,
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Cadastre ingredientes e receitas',
    desc: 'Adicione farinha, ovos, chocolate... informe o preço de compra e a unidade. A mágica começa aqui.',
    icon: ShoppingCart,
  },
  {
    step: '2',
    title: 'Calcule o preço ideal automaticamente',
    desc: 'O sistema calcula custo real, sugere margem de lucro e te mostra o preço de venda ideal.',
    icon: Calculator,
  },
  {
    step: '3',
    title: 'Acompanhe seu lucro e cresça',
    desc: 'Dashboard com faturamento, despesas e lucro. Relatórios para tomar decisões certeiras.',
    icon: BarChart3,
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/90 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <ChefHat size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">IonFinance</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#diferenciais" className="text-sm text-slate-400 hover:text-white transition-colors">Diferenciais</a>
              <a href="#planos" className="text-sm text-slate-400 hover:text-white transition-colors">Planos</a>
              <a href="#como-funciona" className="text-sm text-slate-400 hover:text-white transition-colors">Como Funciona</a>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate-300 hover:text-white transition-colors font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-sm bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95"
              >
                Começar Grátis
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-800/50">
              <a href="#diferenciais" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Diferenciais</a>
              <a href="#planos" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Planos</a>
              <a href="#como-funciona" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="block w-full text-center text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-lg transition-all text-sm"
              >
                Entrar
              </button>
              <button
                onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-5 py-2.5 rounded-lg transition-all text-sm"
              >
                Começar Grátis
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-8">
              <Star size={14} className="text-cyan-400 fill-cyan-400" />
              <span className="text-xs text-cyan-400 font-medium">
                A tecnologia mais inteligente para o controle total da sua confeitaria 🚀
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Sua confeitaria{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                gerenciada como um negócio profissional
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Descubra o custo real de cada receita, controle suas finanças, saiba exatamente seu lucro e 
              venda com confiança. Tudo em um só lugar, sem complicação.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-8 py-3.5 rounded-xl text-lg transition-all hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Começar Teste Grátis de 7 Dias
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-slate-500">Sem cartão de crédito • Acesso imediato</p>
            </div>

            {/* Social proof numbers */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { value: '100%', label: 'Grátis para começar' },
                { value: '2 min', label: 'Para criar conta' },
                { value: '4.9', label: 'Satisfação dos usuários' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== PROBLEMAS ========== */}
      <section id="problemas" className="py-16 sm:py-24 bg-[#020617]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Isso soa familiar?</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Problemas reais que tiram o sono de quem trabalha com comida. A gente resolve.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Calculator,
                title: '"Não sei quanto custa minha receita"',
                desc: 'Ingredientes fracionados, unidades diferentes... fica impossível saber o custo real.',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
              },
              {
                icon: TrendingUp,
                title: '"Perco o controle das despesas"',
                desc: 'Gastos com fornecedor, entrega, embalagem... no fim do mês, cadê o lucro?',
                color: 'text-orange-400',
                bg: 'bg-orange-500/10',
              },
              {
                icon: PieChart,
                title: '"Não sei meu lucro real"',
                desc: 'Vender sem saber a margem é loteria. Você merece ter certeza do seu ganho.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
              },
            ].map((problem, i) => (
              <div
                key={i}
                className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all group"
              >
                <div className={`w-10 h-10 ${problem.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <problem.icon size={20} className={problem.color} />
                </div>
                <h3 className="text-white font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DIFERENCIAIS (MELHOR DO MERCADO) ========== */}
      <section id="diferenciais" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Por que o IonFinance é o melhor do mercado?
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Não somos apenas uma planilha glorificada. Somos um sistema completo com tecnologia de ponta.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {DIFFERENTIATORS.map((item, i) => (
              <div
                key={i}
                className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group"
              >
                <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon size={24} className={item.color} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PLANOS E PREÇOS ========== */}
      <section id="planos" className="py-16 sm:py-24 bg-[#020617]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Planos que crescem com você</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Transparência total. Sem taxas ocultas. Cancele a qualquer momento.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-start">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`relative flex flex-col bg-[#0f172a] border rounded-2xl p-6 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20 scale-105 z-10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                    Mais Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6 h-10">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">R$ {plan.price}</span>
                  {plan.price !== '0' && <span className="text-slate-500 text-sm">/mês</span>}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-center transition-all active:scale-95 ${
                    plan.highlighted
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-8">
            * Oferecemos também a opção de <strong>Setup Inicial</strong> por R$ 150,00 (pagamento único) para configuração completa do seu negócio.
          </p>
        </div>
      </section>

      {/* ========== COMO FUNCIONA ========== */}
      <section id="como-funciona" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Comece em 3 passos simples</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Nada de curva de aprendizado. Você já sai usando.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-cyan-500/50 to-transparent" />
                )}
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all relative z-10">
                  <div className="w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                    {step.step}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-8 sm:p-12 shadow-2xl shadow-cyan-500/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Pronto para transformar sua confeitaria em um negócio lucrativo?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Junte-se a empreendedores que já economizam horas por semana e aumentam seus lucros com o IonFinance.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-10 py-3.5 rounded-xl text-lg transition-all hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 inline-flex items-center gap-2 group"
            >
              Criar Conta Gratuita Agora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400" /> Sem cartão</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400" /> Acesso imediato</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400" /> Suporte incluso</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 border-t border-slate-800/50 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <ChefHat size={20} className="text-cyan-400" />
                <span className="text-lg font-bold text-white">IonFinance</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uma solução desenvolvida com excelência pela <span className="text-cyan-400 font-semibold">IONKOD</span>.
              </p>
            </div>

            {/* Links */}
            <div className="text-center">
              <h4 className="text-sm font-semibold text-white mb-3">Navegação</h4>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <a href="#diferenciais" className="hover:text-cyan-400 transition-colors">Diferenciais</a>
                <a href="#planos" className="hover:text-cyan-400 transition-colors">Planos e Preços</a>
                <button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left md:text-center w-full">Acessar Sistema</button>
              </div>
            </div>

            {/* Contato */}
            <div className="text-center md:text-right">
              <h4 className="text-sm font-semibold text-white mb-3">Fale Conosco</h4>
              <div className="flex flex-col gap-3 text-xs text-slate-400">
                <a 
                  href="mailto:contato@ionfinance.com.br" 
                  className="hover:text-cyan-400 transition-colors flex items-center justify-center md:justify-end gap-2 group"
                >
                  <FileText size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" /> 
                  <span className="group-hover:text-white transition-colors">contato@ionfinance.com.br</span>
                </a>
                <a 
                  href="https://wa.me/5548996126202" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center justify-center md:justify-end gap-2 group"
                  aria-label="Fale conosco pelo WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-500 group-hover:text-green-400 transition-colors">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="group-hover:text-white transition-colors">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} IonKod. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-xs text-slate-600">
              {/* ✅ LINKS ATUALIZADOS PARA AS PÁGINAS JURÍDICAS */}
              <Link to="/termos" className="hover:text-slate-400 transition-colors">Termos de Uso</Link>
              <Link to="/privacidade" className="hover:text-slate-400 transition-colors">Política de Privacidade (LGPD)</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}