import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  title: string;
}

export default function LegalPage({ title }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#071032] text-white font-['Poppins',sans-serif] selection:bg-[#5D53F1] selection:text-white overflow-x-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#5D53F1] rounded-full mix-blend-screen filter blur-[120px] opacity-5" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#141347] rounded-full mix-blend-screen filter blur-[120px] opacity-10" />
            <div className="absolute inset-0 bg-[url('/abstract.svg')] bg-cover bg-center opacity-10" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
            <a href="/landing" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Voltar
            </a>

            <h1 className="text-3xl md:text-5xl font-['Montserrat',sans-serif] font-bold mb-12 text-white">
                {title}
            </h1>

            <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10 shadow-xl min-h-[400px]">
                <div className="prose prose-invert max-w-none text-white/80 space-y-6">
                   
                   {title === 'Termos de condições de uso' && (
                       <>
                           <h2 className="text-2xl font-bold text-white uppercase text-center mb-2">TERMOS DE CONDIÇÕES DE USO</h2>
                           <h3 className="text-xl font-bold text-sky-400 text-center mb-8 uppercase">SCHED AI</h3>
                           
                           <p>
                               Solicitamos que o USUÁRIO leia atentamente os presentes Termos e Condições de Uso e a Política de Privacidade antes de utilizar qualquer funcionalidade da plataforma SCHED AI.
                           </p>
                           <p>
                               A plataforma SCHED AI, doravante denominada “Plataforma”, consiste em um sistema digital de agendamento e comunicação automatizada entre profissionais da área da saúde estética e seus pacientes, por meio de integração com o aplicativo WhatsApp, utilizando tecnologias de automação e inteligência artificial.
                           </p>
                           <p>
                               O presente instrumento regula a utilização da Plataforma pelos profissionais cadastrados (“USUÁRIO”) e pelas pessoas que interagem com o sistema por meio do WhatsApp (“PACIENTE”).
                           </p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA PRIMEIRA – DAS DEFINIÇÕES</h3>
                           <p>Para fins deste Termo, considera-se:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li><strong>Plataforma:</strong> sistema SCHED AI de agendamento e comunicação automatizada.</li>
                               <li><strong>Usuário:</strong> profissional que utiliza a Plataforma para gerenciar agenda e dados.</li>
                               <li><strong>Paciente:</strong> pessoa natural que interage com a Plataforma via WhatsApp.</li>
                               <li><strong>Dados do Paciente:</strong> informações pessoais e sensíveis fornecidas durante o uso da Plataforma.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEGUNDA – DA ACEITAÇÃO</h3>
                           <p>O uso da Plataforma implica a aceitação integral destes Termos e da Política de Privacidade.</p>
                           <p>Caso o Usuário ou o Paciente não concorde com qualquer disposição, deverá cessar imediatamente o uso da Plataforma.</p>
                           <p>Este Termo poderá ser alterado a qualquer tempo, sendo responsabilidade do Usuário consultar a versão vigente.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA TERCEIRA – DO OBJETO DA PLATAFORMA</h3>
                           <p>A Plataforma tem por objetivo:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Atuar como plataforma de gestão completa para clínicas e consultórios, reunindo em um único sistema as principais funcionalidades necessárias à organização da rotina do profissional de saúde;</li>
                               <li>II. Automatizar a comunicação com os Pacientes por meio de agente virtual de inteligência artificial integrado ao WhatsApp, responsável por realizar agendamentos, cancelamentos, remarcações, fornecimento de informações sobre atendimentos e consulta de dados cadastrais;</li>
                               <li>III. Integrar e organizar agenda, prontuário e histórico clínico, permitindo ao Profissional o controle de seus atendimentos, horários e registros;</li>
                               <li>IV. Otimizar a gestão do tempo e das atividades administrativas do Profissional, possibilitando maior foco no atendimento humanizado e na saúde de seus Pacientes.</li>
                           </ul>
                           <p>A Plataforma não realiza diagnóstico médico, prescrição de medicamentos ou orientação clínica, atuando exclusivamente como ferramenta tecnológica de apoio à gestão e comunicação.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUARTA – DAS FUNCIONALIDADES</h3>
                           <p>A Plataforma disponibiliza ao Usuário:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>a) Gestão de agenda;</li>
                               <li>b) Cadastro de pacientes;</li>
                               <li>c) Histórico de atendimentos;</li>
                               <li>d) Armazenamento de registros e imagens clínicas;</li>
                               <li>e) Atendimento automatizado via WhatsApp;</li>
                               <li>f) Consulta de horários disponíveis;</li>
                               <li>g) Envio de confirmações e lembretes.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUINTA – DA UTILIZAÇÃO DO WHATSAPP</h3>
                           <p>O Paciente declara ciência de que o atendimento ocorre por meio do aplicativo WhatsApp, operado por empresa terceira (Meta Platforms Inc.).</p>
                           <p>O Paciente autoriza expressamente o contato por esse meio para fins de agendamento, confirmação, cancelamento e informações sobre serviços.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEXTA – DO TRATAMENTO DE DADOS PESSOAIS</h3>
                           <p>O tratamento de dados será realizado conforme a Política de Privacidade e a legislação vigente, especialmente a Lei nº 13.709/2018 (LGPD).</p>
                           <p>O Usuário é responsável por obter o consentimento do Paciente para coleta e uso de seus dados, inclusive dados sensíveis e imagens.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SÉTIMA – DAS OBRIGAÇÕES DO USUÁRIO</h3>
                           <p>O Usuário compromete-se a:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Utilizar a Plataforma de forma ética e legal;</li>
                               <li>II. Inserir dados verdadeiros e atualizados;</li>
                               <li>III. Obter consentimento dos pacientes;</li>
                               <li>IV. Proteger suas credenciais de acesso;</li>
                               <li>V. Responder pelo conteúdo inserido.</li>
                           </ul>
                           <p>É vedado utilizar a Plataforma para fins ilícitos ou não autorizados.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA OITAVA – DAS RESPONSABILIDADES DA PLATAFORMA</h3>
                           <p>A Plataforma não se responsabiliza:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>a) Por falhas de conexão ou indisponibilidade do WhatsApp;</li>
                               <li>b) Por informações inseridas pelo Usuário;</li>
                               <li>c) Por condutas do Usuário perante seus pacientes;</li>
                               <li>d) Por interrupções técnicas necessárias para manutenção;</li>
                               <li>e) Por ataques de terceiros.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA NONA – DA PROPRIEDADE INTELECTUAL</h3>
                           <p>Todos os direitos sobre a Plataforma, marca, layout, código-fonte e funcionalidades pertencem ao SCHED AI.</p>
                           <p>É proibida a reprodução ou modificação sem autorização expressa.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA – DO CANCELAMENTO</h3>
                           <p>O Usuário poderá solicitar o encerramento de sua conta a qualquer tempo.</p>
                           <p>A Plataforma poderá suspender o acesso em caso de violação destes Termos.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA PRIMEIRA – DAS MODIFICAÇÕES</h3>
                           <p>Estes Termos poderão ser alterados a qualquer tempo, passando a vigorar após sua publicação.</p>
                           <p>O uso contínuo da Plataforma implicará aceitação tácita das novas condições.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA SEGUNDA – DO USO DE INTELIGÊNCIA ARTIFICIAL</h3>
                           <p>A Plataforma utiliza tecnologias de inteligência artificial para criação e operação de agentes virtuais personalizados para cada clínica, os quais realizam a interação automatizada com os Pacientes por meio de canais de comunicação digitais, especialmente WhatsApp, com a finalidade de viabilizar agendamentos, cancelamentos, remarcações, fornecimento de informações sobre serviços e organização de dados administrativos.</p>
                           <p>As interações realizadas por meio dos agentes virtuais poderão ser armazenadas e tratadas exclusivamente para fins de funcionamento, segurança, auditoria e aprimoramento do sistema, sempre em conformidade com a legislação vigente.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA TERCEIRA – DA LEI E FORO</h3>
                           <p>Este Termo será regido pelas leis da República Federativa do Brasil.</p>
                           <p>Fica eleito o foro da comarca do domicílio do Usuário para dirimir quaisquer controvérsias.</p>
                           <p className="mt-8 font-bold text-center">Declaro que li, compreendi e concordo integralmente com os presentes Termos e Condições de Uso.</p>
                       </>
                   )}

                   {title === 'Política de Privacidade' && (
                       <>
                           <h2 className="text-2xl font-bold text-white uppercase text-center mb-2">POLÍTICA DE PRIVACIDADE</h2>
                           <h3 className="text-xl font-bold text-sky-400 text-center mb-8 uppercase">SCHED AI</h3>

                           <p>
                               A presente Política de Privacidade tem por finalidade demonstrar o compromisso da SCHED AI, pessoa física desenvolvedora e responsável pela plataforma digital denominada “Sched AI”, doravante denominada “Plataforma”, com a privacidade e a proteção dos dados pessoais coletados de seus Usuários Profissionais e Pacientes, estabelecendo as regras sobre o tratamento dos dados no âmbito dos serviços e funcionalidades oferecidos, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais – LGPD), com transparência e clareza.
                           </p>
                           <p>
                               Ao utilizar a Plataforma ou interagir com o agente virtual via WhatsApp, o Usuário declara ter lido e compreendido integralmente a presente Política de Privacidade, manifestando seu consentimento livre, informado e inequívoco para o tratamento de seus dados pessoais nos termos aqui previstos. Caso não concorde com as disposições deste documento, deverá se abster de utilizar os serviços.
                           </p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA PRIMEIRA – DAS DEFINIÇÕES</h3>
                           <p>Para fins deste documento, considera-se:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li><strong>I. Plataforma:</strong> sistema digital Sched AI, destinado à gestão de agenda, prontuário e comunicação automatizada entre profissionais de saúde e pacientes.</li>
                               <li><strong>II. Usuário Profissional:</strong> profissional de saúde que utiliza a Plataforma para gestão de atendimentos.</li>
                               <li><strong>III. Paciente:</strong> pessoa física que interage com o agente virtual da Plataforma por meio do WhatsApp.</li>
                               <li><strong>IV. Dados Pessoais:</strong> quaisquer informações relacionadas a pessoa natural identificada ou identificável.</li>
                               <li><strong>V. Dados Sensíveis:</strong> dados relativos à saúde, imagens clínicas, prontuário, histórico de atendimento e informações correlatas.</li>
                               <li><strong>VI. Agente Virtual:</strong> sistema de inteligência artificial integrado ao WhatsApp, responsável por automatizar o atendimento ao Paciente.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEGUNDA – DA COLETA E USO DE DADOS</h3>
                           <h4 className="font-bold text-sky-300 mt-4">2.1. Dados do Paciente</h4>
                           <p>Poderão ser coletados os seguintes dados:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Dados cadastrais obrigatórios: nome completo, CPF, telefone e e-mail.</li>
                               <li>II. Dados facultativos: endereço, data de nascimento e histórico de atendimentos.</li>
                               <li>III. Dados sensíveis: informações de saúde, registros clínicos, imagens de procedimentos, fotos clínicas, prontuário e observações profissionais.</li>
                           </ul>
                           <p><strong>Finalidades:</strong> identificação do Paciente, agendamento, cancelamento e remarcação de consultas, organização do histórico clínico e viabilização da comunicação automatizada via WhatsApp.</p>

                           <h4 className="font-bold text-sky-300 mt-4">2.2. Dados do Usuário Profissional</h4>
                           <p>Nome, telefone, e-mail e informações administrativas necessárias à utilização da Plataforma.</p>
                           <p><strong>Finalidade:</strong> autenticação, gestão da agenda, registro de atendimentos e uso das funcionalidades do sistema.</p>

                           <h4 className="font-bold text-sky-300 mt-4">2.3. Registros Eletrônicos</h4>
                           <p>IP, registros de acesso, interações via WhatsApp e histórico de operações no sistema.</p>
                           <p><strong>Finalidade:</strong> segurança, auditoria, funcionamento da Plataforma e cumprimento de obrigações legais.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA TERCEIRA – DA RESPONSABILIDADE PELOS DADOS</h3>
                           <p>O Usuário Profissional é responsável pela veracidade e atualização dos dados inseridos na Plataforma.</p>
                           <p>A Plataforma atua como operadora de dados em relação aos dados dos Pacientes, sendo o Usuário Profissional o controlador das informações clínicas inseridas.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUARTA – DO ARMAZENAMENTO E DA SEGURANÇA</h3>
                           <p>Os dados são armazenados em ambiente de computação em nuvem, com aplicação de medidas técnicas e administrativas aptas a protegê-los contra acessos não autorizados, perda, alteração ou divulgação indevida.</p>
                           <p>A Plataforma emprega mecanismos de controle de acesso, criptografia, backup e segregação de dados por clínica ou profissional.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUINTA – DO COMPARTILHAMENTO DE DADOS</h3>
                           <p>Os dados poderão ser compartilhados:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Mediante ordem judicial ou requisição legal;</li>
                               <li>II. Com provedores de infraestrutura tecnológica necessários ao funcionamento da Plataforma;</li>
                               <li>III. Entre profissionais de uma mesma clínica, conforme regras definidas pelo Usuário Profissional.</li>
                           </ul>
                           <p>Os dados não serão utilizados para fins publicitários ou de marketing.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEXTA – DO CONSENTIMENTO</h3>
                           <p>O consentimento é coletado de forma livre, informada e inequívoca.</p>
                           <p>O Paciente autoriza expressamente:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. O contato via WhatsApp por agente virtual da Plataforma;</li>
                               <li>II. O registro e armazenamento de seus dados pessoais e sensíveis;</li>
                               <li>III. O armazenamento de imagens clínicas e fotografias de procedimentos para fins de prontuário e histórico.</li>
                           </ul>
                           <p>O consentimento poderá ser revogado a qualquer tempo, mediante solicitação ao profissional responsável pelo atendimento.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SÉTIMA – DOS DIREITOS DO TITULAR</h3>
                           <p>O Titular poderá solicitar:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Acesso aos dados;</li>
                               <li>II. Correção de dados;</li>
                               <li>III. Limitação do tratamento;</li>
                               <li>IV. Exclusão, quando aplicável legalmente.</li>
                           </ul>
                           <p>Solicitações relacionadas a prontuário deverão ser feitas diretamente ao profissional responsável.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA OITAVA – DO USO DE INTELIGÊNCIA ARTIFICIAL</h3>
                           <p>A Plataforma utiliza tecnologia de inteligência artificial para criar agentes virtuais personalizados para cada clínica, responsáveis pela interação automatizada com os Pacientes via WhatsApp.</p>
                           <p>As interações poderão ser registradas para fins de funcionamento, auditoria e aprimoramento do sistema, respeitada a legislação vigente.</p>
                           <p>A Plataforma não realiza diagnóstico médico, prescrição de medicamentos ou orientação clínica.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA NONA – DAS DISPOSIÇÕES GERAIS</h3>
                           <p>A Plataforma poderá alterar esta Política de Privacidade a qualquer tempo, sendo recomendada a revisão periódica.</p>
                           <p>Toda comunicação eletrônica será considerada válida como prova documental.</p>
                           <p>Caso alguma cláusula seja considerada inválida, as demais permanecerão em pleno vigor.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA – DA LEI APLICÁVEL E DO FORO</h3>
                           <p>Este documento será regido pela legislação brasileira, elegendo-se o foro do domicílio do Usuário Profissional para dirimir quaisquer controvérsias, salvo disposição legal diversa.</p>
                       </>
                   )}

                   {title === 'Termos e Condições de uso (Médico)' && (
                       <>
                           <h2 className="text-2xl font-bold text-white uppercase text-center mb-2">TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS E DADOS SENSÍVEIS</h2>
                           <h3 className="text-xl font-bold text-sky-400 text-center mb-8 uppercase">SCHED AI</h3>

                           <p>
                               Este documento tem por objetivo registrar a manifestação livre, informada e inequívoca do Usuário Profissional quanto à sua responsabilidade pelo tratamento dos dados pessoais e dados pessoais sensíveis inseridos na plataforma SCHED AI, plataforma digital de gestão de agenda, prontuário e comunicação automatizada, em conformidade com a Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD).
                           </p>
                           <p>
                               Ao aceitar o presente termo, o Usuário Profissional declara ciência e concorda que será o Controlador dos dados pessoais e dados sensíveis dos pacientes, assumindo integral responsabilidade pelo tratamento dessas informações inseridas na plataforma, cabendo à SCHED AI a atuação como Operadora de dados, limitada à disponibilização da infraestrutura tecnológica.
                           </p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA PRIMEIRA – DAS PARTES</h3>
                           <p>Para os fins deste instrumento, considera-se:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li><strong>I. Usuário Profissional:</strong> profissional de saúde ou estética que utiliza a plataforma SCHED AI para gestão de atendimentos e registros de pacientes;</li>
                               <li><strong>II. Plataforma:</strong> sistema digital SCHED AI;</li>
                               <li><strong>III. Operadora:</strong> SCHED AI, responsável apenas pelo fornecimento do sistema tecnológico.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEGUNDA – DA FINALIDADE DO TRATAMENTO DOS DADOS</h3>
                           <p>Os dados pessoais e dados pessoais sensíveis dos pacientes serão tratados exclusivamente para as seguintes finalidades:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Cadastro de pacientes;</li>
                               <li>II. Agendamento, cancelamento e remarcação de atendimentos;</li>
                               <li>III. Registro de histórico clínico e administrativo;</li>
                               <li>IV. Organização da agenda do profissional;</li>
                               <li>V. Comunicação automatizada com o paciente via WhatsApp;</li>
                               <li>VI. Documentação de procedimentos realizados.</li>
                           </ul>
                           <p>É expressamente vedado o uso dos dados e das imagens para fins de marketing, publicidade, divulgação em redes sociais, portfólio profissional ou qualquer finalidade diversa da assistencial e administrativa.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA TERCEIRA – DOS DADOS TRATADOS</h3>
                           <p>O Usuário Profissional declara que poderá inserir na plataforma, sob sua responsabilidade:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>a) Dados pessoais: nome, CPF, telefone, e-mail, endereço e data de nascimento;</li>
                               <li>b) Dados pessoais sensíveis: informações de saúde, histórico clínico, prontuário simplificado e observações profissionais;</li>
                               <li>c) Registros fotográficos: imagens clínicas e estéticas obtidas antes, durante ou após procedimentos, exclusivamente para fins de acompanhamento, histórico e documentação profissional.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUARTA – DO CONSENTIMENTO DO PACIENTE</h3>
                           <p>O Usuário Profissional declara que:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Obtém previamente do paciente autorização expressa para o tratamento de seus dados pessoais e sensíveis;</li>
                               <li>II. Obtém autorização específica para o registro e armazenamento de imagens clínicas e estéticas;</li>
                               <li>III. Informa ao paciente que seus dados serão armazenados em sistema digital;</li>
                               <li>IV. Mantém sob sua guarda o termo de consentimento assinado pelo paciente.</li>
                           </ul>
                           <p>A ausência de consentimento válido do paciente implica responsabilidade exclusiva do Usuário Profissional.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUINTA – DOS USO DO WHATSAPP</h3>
                           <p>O Usuário Profissional declara ciência de que a comunicação com os pacientes ocorre por meio do aplicativo WhatsApp, operado por empresa terceira (Meta Platforms Inc.), responsabilizando-se por informar o paciente sobre esse meio de comunicação e obter sua autorização para tal contato.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEXTA – DA SEGURANÇA DAS INFORMAÇÕES</h3>
                           <p>O Usuário Profissional compromete-se a:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Utilizar a plataforma de forma segura;</li>
                               <li>II. Não compartilhar logins e senhas;</li>
                               <li>III. Restringir o acesso aos dados apenas a pessoas autorizadas;</li>
                               <li>IV. Zelar pela confidencialidade das informações dos pacientes.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SÉTIMA – DO COMPARTILHAMENTO DE DADOS</h3>
                           <p>Os dados inseridos na plataforma somente poderão ser acessados:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. Pelo próprio Usuário Profissional;</li>
                               <li>II. Por integrantes da mesma clínica, conforme permissões concedidas;</li>
                               <li>III. Pela SCHED AI, apenas para fins técnicos e operacionais.</li>
                           </ul>
                           <p>É vedado o compartilhamento com terceiros para fins comerciais ou publicitários.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA OITAVA – DA IMUTABILIDADE DOS REGISTROS APÓS FINALIZAÇÃO DO ATENDIMENTO</h3>
                           <p>Após a finalização de um atendimento ou procedimento registrado na plataforma SCHED AI, o Usuário Profissional declara ciência de que os dados inseridos referentes àquele atendimento, incluindo informações clínicas, observações e registros fotográficos, não poderão ser alterados, sendo permitida apenas a inclusão de novos registros complementares, quando necessário.</p>
                           <p>Tal medida visa garantir a integridade, autenticidade e rastreabilidade das informações, em conformidade com os princípios da segurança e da boa-fé previstos na legislação aplicável.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA NONA – DA EXCLUSÃO DOS DADOS</h3>
                           <p>O Usuário Profissional declara ciência de que:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>I. A exclusão de dados pessoais e dados sensíveis de pacientes somente poderá ocorrer quando não houver obrigação legal, regulatória ou assistencial que justifique sua manutenção;</li>
                               <li>II. A solicitação de exclusão de dados por parte do paciente deverá ser analisada e executada pelo Usuário Profissional, na qualidade de Controlador dos dados;</li>
                               <li>III. A SCHED AI realizará a exclusão técnica dos dados apenas mediante solicitação expressa do Usuário Profissional, quando juridicamente cabível;</li>
                               <li>IV. A exclusão não se aplica aos dados que devam ser mantidos para cumprimento de obrigação legal ou para resguardo de direitos em eventual processo judicial ou administrativo.</li>
                           </ul>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA – DA VIGÊNCIA</h3>
                           <p>O presente termo vigorará enquanto houver utilização da plataforma SCHED AI pelo Usuário Profissional.</p>

                           <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA PRIMEIRA – DO FORO</h3>
                           <p>Fica eleito o foro da comarca do domicílio do Usuário Profissional para dirimir quaisquer controvérsias oriundas deste termo.</p>
                           <p className="mt-8 font-bold text-center">Declaro que li, compreendi e concordo integralmente com os termos acima, assumindo total responsabilidade pelo tratamento dos dados pessoais, dados sensíveis e imagens dos pacientes inseridos na plataforma SCHED AI, comprometendo-me a utilizá-los exclusivamente para fins assistenciais e administrativos, vedada sua utilização para fins de marketing ou divulgação.</p>
                       </>
                   )}

                   {title === 'Termos e Condições de Uso (Paciente)' && (
                      <>
                          <h2 className="text-2xl font-bold text-white uppercase text-center mb-2">TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS E DADOS SENSÍVEIS</h2>
                          <h3 className="text-xl font-bold text-sky-400 text-center mb-8 uppercase">SCHED AI</h3>

                          <p>
                              Ao assinar o presente Termo, o Paciente declara que leu, compreendeu e concorda, de forma livre, informada e inequívoca, com o tratamento de seus dados pessoais e dados sensíveis no âmbito do atendimento realizado pelo profissional de saúde que utiliza a plataforma Sched AI.
                          </p>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA PRIMEIRA – FINALIDADE</h3>
                          <p>O presente Termo tem por finalidade autorizar:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. O cadastro do Paciente na plataforma Sched AI;</li>
                              <li>II. O registro de informações necessárias ao atendimento;</li>
                              <li>III. O armazenamento de histórico de consultas e procedimentos;</li>
                              <li>IV. A organização do prontuário e do histórico clínico;</li>
                              <li>V. A comunicação entre Paciente e profissional de saúde por meio de agente virtual via WhatsApp;</li>
                              <li>VI. O registro de imagens clínicas e fotografias de procedimentos para fins exclusivos de acompanhamento do tratamento.</li>
                          </ul>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEGUNDA – DADOS COLETADOS</h3>
                          <p>Poderão ser tratados os seguintes dados:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. Dados pessoais: nome completo, CPF, telefone, e-mail, endereço e data de nascimento;</li>
                              <li>II. Dados sensíveis: informações de saúde, registros clínicos, histórico de atendimento e observações profissionais;</li>
                              <li>III. Imagens clínicas: fotos de procedimentos, exames ou registros visuais relacionados ao tratamento.</li>
                          </ul>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA TERCEIRA – USO DOS DADOS</h3>
                          <p>Os dados e imagens do Paciente serão utilizados exclusivamente para:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. Agendamento, cancelamento e remarcação de consultas;</li>
                              <li>II. Organização do prontuário e do histórico clínico;</li>
                              <li>III. Comunicação administrativa e assistencial;</li>
                              <li>IV. Acompanhamento da evolução do tratamento.</li>
                          </ul>
                          <p>Fica expressamente proibido o uso dos dados e imagens para fins publicitários, promocionais, de marketing ou divulgação em redes sociais sem autorização específica e separada do Paciente.</p>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUARTA – ACESSO ÀS INFORMAÇÕES</h3>
                          <p>Os dados e imagens do Paciente:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. Serão acessados apenas pelo profissional de saúde responsável pelo atendimento;</li>
                              <li>II. Poderão ser acessados por profissionais da mesma clínica, se autorizado pelo responsável técnico;</li>
                              <li>III. Não serão compartilhados com terceiros estranhos ao atendimento, salvo por obrigação legal ou ordem judicial.</li>
                          </ul>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA QUINTA – ARMAZENAMENTO E SEGURANÇA</h3>
                          <p>Os dados e imagens serão armazenados em ambiente digital seguro, com medidas técnicas e administrativas destinadas a protegê-los contra acesso não autorizado, perda, alteração ou divulgação indevida.</p>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SEXTA – USO DE INTELIGÊNCIA ARTIFICIAL</h3>
                          <p>O Paciente declara estar ciente de que:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. A plataforma utiliza tecnologia de inteligência artificial para automatizar a comunicação via WhatsApp;</li>
                              <li>II. A inteligência artificial não realiza diagnóstico médico nem prescrição de tratamentos;</li>
                              <li>III. As interações poderão ser registradas para fins de funcionamento do sistema e organização do atendimento.</li>
                          </ul>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA SÉTIMA – CONSENTIMENTO PARA CONTATO VIA WHATSAPP</h3>
                          <p>O Paciente autoriza expressamente:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. O recebimento de mensagens via WhatsApp para agendamento, confirmação, cancelamento e informações relacionadas ao atendimento;</li>
                              <li>II. O uso desse canal como meio oficial de comunicação administrativa com a clínica.</li>
                          </ul>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA OITAVA – DIREITOS DO PACIENTE</h3>
                          <p>O Paciente poderá, a qualquer tempo:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. Solicitar acesso aos seus dados;</li>
                              <li>II. Solicitar correção de informações;</li>
                              <li>III. Solicitar a limitação do tratamento;</li>
                              <li>IV. Solicitar a exclusão dos dados, quando permitido por lei.</li>
                          </ul>
                          <p>As solicitações relacionadas ao prontuário deverão ser feitas diretamente ao profissional responsável pelo atendimento.</p>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA NONA – REVOGAÇÃO DO CONSENTIMENTO</h3>
                          <p>O Paciente poderá revogar este consentimento a qualquer momento, mediante solicitação ao profissional responsável, ciente de que:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. A revogação poderá inviabilizar a continuidade do atendimento;</li>
                              <li>II. Dados já registrados poderão ser mantidos quando houver obrigação legal ou regulatória.</li>
                          </ul>

                          <h3 className="text-lg font-bold text-white mt-8 uppercase">CLÁUSULA DÉCIMA – DECLARAÇÃO FINAL</h3>
                          <p>O Paciente declara que:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>I. Recebeu explicações claras sobre o tratamento de seus dados;</li>
                              <li>II. Compreende que seus dados serão utilizados apenas para fins clínicos e administrativos;</li>
                              <li>III. Autoriza o registro e armazenamento de informações de saúde e imagens clínicas;</li>
                              <li>IV. Autoriza o contato via WhatsApp para fins relacionados ao atendimento;</li>
                              <li>V. Concorda integralmente com os termos deste documento.</li>
                          </ul>

                          <p className="mt-8 font-bold text-center">Declaro que li, compreendi e concordo integralmente com os termos acima, autorizando de forma livre, informada e inequívoca o tratamento dos meus dados pessoais, dados sensíveis e imagens clínicas inseridos na plataforma SCHED AI, exclusivamente para fins assistenciais e de registro do meu histórico de atendimento, vedada sua utilização para fins de marketing ou divulgação.</p>
                      </>
                   )}
                   
                   {!['Termos de condições de uso', 'Política de Privacidade', 'Termos e Condições de uso (Médico)', 'Termos e Condições de uso (Paciente)'].includes(title) && (
                        <p className="text-lg italic text-white/40 text-center mt-20">
                           [Espaço reservado para o texto de {title}]
                       </p>
                   )}
                </div>
            </div>
            
            <div className="mt-12 text-center text-white/40 text-sm">
                <p>&copy; {new Date().getFullYear()} Sched AI. Todos os direitos reservados.</p>
            </div>
        </div>
    </div>
  );
}
