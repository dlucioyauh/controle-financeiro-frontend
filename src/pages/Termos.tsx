import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Termos() {
  return (
    <div className="min-h-screen bg-[#020617] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-[#0f172a] border border-slate-800 rounded-xl p-8 md:p-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o início
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Termos de Uso</h1>
        <p className="text-slate-400 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o IonFinance, você aceita e concorda com estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Descrição do Serviço</h2>
            <p>
              O IonFinance é uma plataforma de gestão financeira que oferece ferramentas para controle 
              de vendas, despesas, clientes, relatórios e automações. O serviço é fornecido "como está" 
              e "conforme disponibilidade".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Contas e Cadastro</h2>
            <p>
              Para utilizar o IonFinance, você deve criar uma conta fornecendo informações precisas e completas. 
              Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as 
              atividades que ocorram em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Planos e Pagamentos</h2>
            <p>
              O IonFinance oferece planos Free, Basic, Pro e Premium. Os planos pagos são cobrados mensalmente 
              através da plataforma Stripe. O cancelamento pode ser feito a qualquer momento, e você manterá 
              acesso até o final do período já pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, funcionalidades e tecnologia do IonFinance são de propriedade da IONKOD e 
              protegidos por leis de direitos autorais e propriedade intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Limitação de Responsabilidade</h2>
            <p>
              O IonFinance não se responsabiliza por decisões financeiras tomadas com base nas informações 
              fornecidas pela plataforma. Recomendamos sempre consultar um profissional contábil ou financeiro 
              para decisões importantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar sua conta a qualquer momento, com ou sem aviso prévio, por violação 
              destes termos ou por qualquer outro motivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em 
              vigor imediatamente após sua publicação na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">9. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer controvérsia 
              será resolvida no foro da comarca de Florianópolis/SC.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">10. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato conosco pelo e-mail: 
              <a href="mailto:contato@ionfinance.com.br" className="text-cyan-400 hover:underline"> contato@ionfinance.com.br</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}