import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacidade() {
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

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Política de Privacidade</h1>
        <p className="text-slate-400 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Introdução</h2>
            <p>
              A IONKOD, operadora do IonFinance, está comprometida com a proteção de seus dados pessoais. 
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas 
              informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Dados que Coletamos</h2>
            <p>Coletamos as seguintes categorias de dados:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone, nome do negócio</li>
              <li><strong>Dados financeiros:</strong> receitas, despesas, vendas, clientes (inseridos por você)</li>
              <li><strong>Dados de uso:</strong> informações sobre como você utiliza nossa plataforma</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Como Usamos seus Dados</h2>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Fornecer e manter o serviço IonFinance</li>
              <li>Processar pagamentos e assinaturas</li>
              <li>Enviar comunicações relacionadas ao serviço (e-mails transacionais)</li>
              <li>Melhorar nossa plataforma e desenvolver novas funcionalidades</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Base Legal para o Tratamento</h2>
            <p>
              Tratamos seus dados com base nas seguintes hipóteses legais da LGPD:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Execução de contrato:</strong> para fornecer o serviço contratado</li>
              <li><strong>Legítimo interesse:</strong> para melhoria contínua da plataforma</li>
              <li><strong>Cumprimento de obrigação legal:</strong> quando exigido por lei</li>
              <li><strong>Consentimento:</strong> para comunicações de marketing (quando aplicável)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros com criptografia SSL/TLS. 
              Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados 
              contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Compartilhamento de Dados</h2>
            <p>
              Não vendemos seus dados pessoais. Compartilhamos dados apenas com:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Stripe:</strong> para processamento de pagamentos</li>
              <li><strong>Resend:</strong> para envio de e-mails transacionais</li>
              <li><strong>Autoridades:</strong> quando exigido por lei ou ordem judicial</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Seus Direitos (LGPD)</h2>
            <p>
              Você tem os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Acesso aos seus dados</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Exclusão dos dados (direito ao esquecimento)</li>
              <li>Portabilidade dos dados</li>
              <li>Revogação do consentimento</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato conosco pelo e-mail: 
              <a href="mailto:privacidade@ionfinance.com.br" className="text-cyan-400 hover:underline"> privacidade@ionfinance.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos 
              para entender como os usuários interagem com nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">9. Retenção de Dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, 
              conservamos os dados pelo período necessário para cumprir obrigações legais e contratuais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
              através do e-mail cadastrado ou por aviso destacado na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">11. Contato do Encarregado de Dados (DPO)</h2>
            <p>
              Para questões sobre privacidade e proteção de dados, entre em contato:
            </p>
            <p className="mt-2">
              E-mail: <a href="mailto:privacidade@ionfinance.com.br" className="text-cyan-400 hover:underline">privacidade@ionfinance.com.br</a><br />
              Endereço: Florianópolis, SC - Brasil
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}