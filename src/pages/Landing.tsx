// src/pages/Landing.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  PieChart,
  Users,
  FileText,
  ChefHat,
  DollarSign,
  ShoppingCart,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Star,
  Menu,
  X,
} from 'lucide-react';

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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <ChefHat size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">IonFinance</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#problemas" className="text-sm text-slate-400 hover:text-white transition-colors">Problemas</a>
              <a href="#funcionalidades" className="text-sm text-slate-400 hover:text-white transition-colors">Funcionalidades</a>
              <a href="#como-funciona" className="text-sm text-slate-400 hover:text-white transition-colors">Como Funciona</a>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate-300 hover:text-white transition-colors font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-sm bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95"
              >
                Começar Grátis
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-800/50">
              <a href="#problemas" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Problemas</a>
              <a href="#funcionalidades" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
              <a href="#como-funciona" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
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
              <span className="text-xs text-cyan-400 font-medium">O melhor para confeiteiros e pequenos negócios 🚀</span>
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
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-8 py-3.5 rounded-xl text-lg transition-all hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Começar Grátis Agora
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

      {/* ========== FUNCIONALIDADES ========== */}
      <section id="funcionalidades" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Ferramentas profissionais que transformam sua confeitaria em um negócio lucrativo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: Calculator,
                title: 'Precificação Inteligente',
                desc: 'Cálculo automático de custo por receita, unidade e fatia. Ingredientes fracionados? A gente resolve.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
              },
              {
                icon: DollarSign,
                title: 'Controle Financeiro',
                desc: 'Registre despesas, acompanhe fluxo de caixa e saiba exatamente seu saldo em tempo real.',
                color: 'text-green-400',
                bg: 'bg-green-500/10',
              },
              {
                icon: Users,
                title: 'Gestão de Clientes',
                desc: 'Cadastre clientes, acompanhe histórico de vendas e descubra quem mais compra de você.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                icon: FileText,
                title: 'Relatórios Profissionais',
                desc: 'Exporte relatórios em PDF e Excel com gráficos, tabelas e análises completas do seu negócio.',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group"
              >
                <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <feature.icon size={18} className={feature.color} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMO FUNCIONA ========== */}
      <section id="como-funciona" className="py-16 sm:py-24 bg-[#020617]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Comece em 3 passos simples</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Nada de curva de aprendizado. Você já sai usando.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                step: '1',
                title: 'Cadastre seus ingredientes e receitas',
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
            ].map((step, i) => (
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
              Junte-se a dezenas de confeiteiros que já estão precificando corretamente e lucrando mais.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-10 py-3.5 rounded-xl text-lg transition-all hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 inline-flex items-center gap-2 group"
            >
              Começar Grátis Agora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400" /> Sem cartão</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400" /> Acesso imediato</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400" /> Suporte incluso</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat size={16} className="text-cyan-400" />
            <span className="text-sm font-bold text-white">IonFinance</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} IonKod. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}