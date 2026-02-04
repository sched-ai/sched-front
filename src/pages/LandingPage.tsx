import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Menu, X, Instagram, Facebook, Linkedin, PlayCircle, Calendar, Clock, Users, Bell } from 'lucide-react'

// Hook simples para animação ao scroll
function useOnScreen(options: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true)
                observer.disconnect()
            }
        }, options)

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current)
        }
    }, [ref, options])

    return [ref, isVisible] as const
}

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const options = useMemo(() => ({ threshold: 0.1 }), [])
    const [ref, isVisible] = useOnScreen(options)
    
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

export default function LandingPage() {
    const navigate = useNavigate()
    // -- Header Logic --
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isMenuOpen])

    const toggleMenu = () => setIsMenuOpen(o => !o)
    const closeMenu = () => setIsMenuOpen(false)

    // -- Beta Form Logic --
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    function onFormSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setIsFormSubmitted(true)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[#071032] text-white font-['Poppins',sans-serif] selection:bg-[#5D53F1] selection:text-white overflow-x-hidden">
            
            {/* Background Elements - Suavizados */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#5D53F1] rounded-full mix-blend-screen filter blur-[120px] opacity-5" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#141347] rounded-full mix-blend-screen filter blur-[120px] opacity-10" />
                <div className="absolute inset-0 bg-[url('/abstract.svg')] bg-cover bg-center opacity-10" />
            </div>

            {/* HEADER */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
                    scrolled 
                        ? 'bg-[#071032]/80 backdrop-blur-md py-3 border-white/10 shadow-lg' 
                        : 'bg-transparent py-5 border-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <img src="/logotipo.svg" alt="Sched" width={40} height={40} className="group-hover:rotate-12 transition-transform duration-500" />
                        <span className="font-['Montserrat',sans-serif] font-bold text-xl tracking-tight hidden sm:block">Sched<span className="text-sky-400">.ai</span></span>
                    </div>

                    <nav className="hidden md:flex gap-8 items-center font-medium text-sm">
                        {['Início', 'Recursos', 'Acesso Antecipado'].map((item) => (
                            <a 
                                key={item} 
                                href={`#${item === 'Início' ? 'hero' : item === 'Recursos' ? 'features' : 'beta'}`}
                                className="relative text-white/80 hover:text-white transition-colors py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-sky-400 after:transition-all after:duration-300 hover:after:w-full"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                         <div className="flex gap-4 pr-6 border-r border-white/10">
                            {[
                                { Icon: Instagram, href: "#" },
                                { Icon: Facebook, href: "#" },
                                { Icon: Linkedin, href: "#" }
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} className="text-white/60 hover:text-sky-400 hover:scale-110 transition-all">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                        <a 
                            href="#beta"
                            className="px-5 py-2 bg-white text-[#121535] rounded-full font-bold text-sm hover:bg-sky-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5"
                        >
                            Começar Agora
                        </a>
                    </div>

                    <button className="md:hidden text-white p-2" onClick={toggleMenu}>
                        <Menu size={28} />
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed inset-0 bg-[#071032]/98 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                    <button className="absolute top-6 right-6 text-white/80 hover:text-white" onClick={closeMenu}>
                        <X size={32} />
                    </button>
                    {['Início', 'Recursos', 'Acesso Antecipado'].map((item) => (
                        <a 
                            key={item}
                            href={`#${item === 'Início' ? 'hero' : item === 'Recursos' ? 'features' : 'beta'}`} 
                            onClick={closeMenu}
                            className="text-3xl font-bold hover:text-sky-400 transition-colors"
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </header>

            {/* HERO */}
            <section id="hero" className="relative z-10 pt-32 pb-20 px-6 min-h-screen flex items-center justify-center overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* LEFT: Illustration / Mockup */}
                    <div className="relative order-2 lg:order-2 animate-[fadeIn_1.5s_ease-out]">
                        <div className="relative w-full h-[400px] sm:h-[500px] perspective-1000">
                             {/* Floating Notification */}
                             <div className="absolute top-[10%] -left-4 z-20 bg-[#1e293b]/90 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-2xl flex items-center gap-3 animate-bounce hover:scale-105 transition-transform cursor-default" style={{ animationDuration: '3s' }}>
                                <div className="bg-green-500/20 text-green-400 p-2 rounded-full">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">Status</div>
                                    <div className="text-sm font-bold text-white">Confirmado</div>
                                </div>
                            </div>
                            
                             {/* Floating Stats */}
                            <div className="absolute bottom-[15%] -right-4 z-20 bg-[#1e293b]/90 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-2xl animate-pulse" style={{ animationDuration: '4s' }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Users size={16} className="text-sky-400" />
                                    <span className="text-sm font-bold text-white">Novos Pacientes</span>
                                </div>
                                <div className="flex -space-x-2">
                                     {[1,2,3].map(i => (
                                         <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#1e293b] flex items-center justify-center text-[10px] font-bold">
                                             {String.fromCharCode(64+i)}
                                         </div>
                                     ))}
                                     <div className="w-8 h-8 rounded-full bg-sky-500 text-white border-2 border-[#1e293b] flex items-center justify-center text-[10px] font-bold">+5</div>
                                </div>
                            </div>

                            {/* Main App Window */}
                            <div className="absolute inset-4 sm:inset-8 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:rotate-y-6 md:rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                                {/* Fake Header */}
                                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                                        <Calendar size={12} />
                                        <span>Agenda Semanal</span>
                                    </div>
                                    <Bell size={16} className="text-white/40" />
                                </div>

                                {/* Body */}
                                <div className="flex flex-1 overflow-hidden">
                                     {/* Sidebar */}
                                    <div className="w-16 border-r border-white/10 flex flex-col items-center py-6 gap-6 bg-white/5">
                                        {[Calendar, Users, Clock].map((Icon, idx) => (
                                            <div key={idx} className={`p-2 rounded-lg ${idx === 0 ? 'bg-sky-500/20 text-sky-400' : 'text-white/40'}`}>
                                                <Icon size={20} />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Main Content Area */}
                                    <div className="flex-1 p-6 relative">
                                        {/* Grid Lines */}
                                        <div className="space-y-4">
                                            {[
                                                { time: '09:00', event: 'Consulta Inicial - Ana M.', color: 'bg-sky-500/20 border-sky-500/30 text-sky-200' },
                                                { time: '10:00', event: '', color: '' },
                                                { time: '11:00', event: 'Retorno - Calos D.', color: 'bg-purple-500/20 border-purple-500/30 text-purple-200' },
                                                { time: '13:00', event: 'Almoço', color: 'bg-white/5 border-white/10 text-white/40' },
                                                { time: '14:00', event: 'Exame - Luiza P.', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' },
                                            ].map((slot, i) => (
                                                <div key={i} className="flex items-center gap-4 group">
                                                    <span className="text-xs text-white/40 font-mono w-10">{slot.time}</span>
                                                    <div className={`flex-1 h-12 rounded-lg border flex items-center px-4 text-sm font-medium transition-all ${slot.event ? slot.color : 'border-white/5 dashed hover:bg-white/5'}`}>
                                                        {slot.event || <span className="text-white/10 group-hover:text-white/30 text-xs">+ Adicionar</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Text Content */}
                    <div className="order-1 lg:order-1 text-center lg:text-left animate-[fadeInUp_1s_ease-out]">
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 font-['Montserrat',sans-serif] tracking-tight text-white">
                            Transforme seu negócio <br/>
                            <span className="text-sky-400">em um clique</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed lg:max-w-xl">
                            A inteligência artificial que sua clínica precisa, promovendo uma experiência fluida, automatizada e centrada no médico.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                            <a 
                                href="#beta" 
                                className="group relative px-8 py-4 bg-white text-[#121535] rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    QUERO TESTAR <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                            <a 
                                href="#features" 
                                className="px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 hover:border-white/40 transition-all flex items-center gap-2"
                            >
                                <PlayCircle className="w-5 h-5" /> Ver demonstração
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="relative py-32 px-6 bg-gradient-to-b from-[#141347] to-[#071032]">
                <div className="max-w-7xl mx-auto">
                    <FadeInSection>
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-5xl font-extrabold font-['Montserrat',sans-serif]">
                                    PLATAFORMA DE <br/>
                                    <span className="text-sky-400">AGENDAMENTO</span>
                                </h2>
                                <p className="text-2xl text-white/80 font-light">
                                    Simplicidade na gestão com o poder da Inteligência Artificial.
                                </p>
                                
                                <ul className="space-y-5 mt-8">
                                    {['Agendamento Inteligente', 'Gestão de Pacientes', 'Relatórios em Tempo Real', 'Notificações Automáticas'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-lg text-white/90">
                                            <div className="p-1 rounded-full bg-sky-500/20 text-sky-400">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#5D53F1] to-sky-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f32]/80 backdrop-blur-sm shadow-2xl">
                                    <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                    </div>
                                    <div className="pt-10">
                                        <video
                                            className="w-full h-auto aspect-video object-cover"
                                            src="/test-video.mp4"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* BETA FORM */}
            <section id="beta" className="relative py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/logotipo.svg')] bg-no-repeat bg-center opacity-[0.03] scale-150 animate-[spin_120s_linear_infinite]" />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <FadeInSection>
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-5xl font-extrabold font-['Montserrat',sans-serif] leading-tight">
                                    O futuro da gestão <br/>
                                    médica começa <span className="text-sky-400">aqui.</span>
                                </h2>
                                <p className="text-lg text-white/70 leading-relaxed">
                                    Não perca a oportunidade de transformar sua clínica. Preencha o formulário e garanta acesso exclusivo à versão Beta do Sched.AI.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-3xl blur-xl" />
                                <div className="relative bg-[#07071d]/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-sky-500 rounded-full" />
                                        Acesso Antecipado
                                    </h3>

                                    {!isFormSubmitted ? (
                                        <form className="space-y-6" onSubmit={onFormSubmit}>
                                            <div className="space-y-2">
                                                <label className="text-sm text-white/60 ml-1">Nome Completo</label>
                                                <input 
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:bg-white/10 transition-all font-medium" 
                                                    type="text" 
                                                    required
                                                    placeholder="Dr. Exemplo da Silva" 
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm text-white/60 ml-1">E-mail Corporativo</label>
                                                <input 
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:bg-white/10 transition-all font-medium" 
                                                    type="email" 
                                                    required
                                                    placeholder="contato@clinica.com" 
                                                />
                                            </div>

                                            <button 
                                                className={`w-full py-4 bg-white text-[#121535] rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex justify-center items-center gap-2 ${loading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02]'}`} 
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <span className="w-6 h-6 border-2 border-[#121535] border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>FAÇA PARTE <ArrowRight size={20} /></>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="text-center py-20 animate-[fadeIn_0.5s_ease-out]">
                                            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <h4 className="text-2xl font-bold text-white mb-2">Sucesso!</h4>
                                            <p className="text-white/60">
                                                Seus dados foram recebidos.<br/>Em breve entraremos em contato.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-20 border-t border-white/5 bg-[#071032] pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Top Section: Logo & Social */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <img src='/logo.svg' alt="Sched.ai" className="h-16 w-auto brightness-200 contrast-0 grayscale md:grayscale-0 md:brightness-100 md:contrast-100" />
                            <p className="text-white/70 text-sm max-w-[200px] text-center md:text-left">
                                Transformando a gestão de clínicas e consultórios.
                            </p>
                        </div>
                        
                        <div className="flex gap-8">
                            {[
                                { Icon: Instagram, href: "#" },
                                { Icon: Facebook, href: "#" },
                                { Icon: Linkedin, href: "#" }
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white hover:text-[#050B26] hover:-translate-y-2 transition-all duration-300">
                                    <Icon size={24} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Middle Section: Links Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 border-t border-white/5 pt-12">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <h4 className="font-bold text-white text-lg">Legal</h4>
                            <nav className="flex flex-col gap-2 text-center md:text-left">
                                <span onClick={() => navigate('/politica-privacidade')} className="text-white/60 hover:text-sky-400 transition-colors text-sm cursor-pointer">Política de Privacidade</span>
                                <span onClick={() => navigate('/termos-uso')} className="text-white/60 hover:text-sky-400 transition-colors text-sm cursor-pointer">Termos de condições de uso</span>
                                <span onClick={() => navigate('/termos-medico')} className="text-white/60 hover:text-sky-400 transition-colors text-sm cursor-pointer">Termos e Condições de uso (Médico)</span>
                                <span onClick={() => navigate('/termos-paciente')} className="text-white/60 hover:text-sky-400 transition-colors text-sm cursor-pointer">Termos e Condições de Uso (Paciente)</span>
                            </nav>
                        </div>
                    </div>
                
                    <div className="border-t border-white/5 pt-8 text-center text-white/60 text-sm">
                        <p>© {new Date().getFullYear()} Sched AI. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
