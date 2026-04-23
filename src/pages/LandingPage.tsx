import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Menu, X, Instagram, Facebook, Linkedin, Calendar, MessageSquare, ShieldCheck, Activity, FileText, Image as ImageIcon, Zap, ChevronRight, PlayCircle, Send } from 'lucide-react'
import React from 'react'
import abstract from '../assets/abstract_signup.png'

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

const FadeInSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
    const options = useMemo(() => ({ threshold: 0.1 }), [])
    const [ref, isVisible] = useOnScreen(options)
    
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

// Hero Agenda Mockup Component
const InteractiveAgendaMockup = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const hours = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
    
    interface Appt {
        day: string;
        hour: string;
        title: string;
        type: string;
        animate?: boolean;
    }

    const [appointments, setAppointments] = useState<Appt[]>([
        { day: 'Seg', hour: '09:00', title: 'Avaliação - João', type: 'confirmado' },
        { day: 'Qua', hour: '14:00', title: 'Retorno - Ana', type: 'confirmado' },
    ]);
    
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        // Simular a IA adicionando um agendamento repetidamente
        const interval = setInterval(() => {
            setIsSimulating(true);
            setTimeout(() => {
                setAppointments(prev => {
                    const newAppt: Appt = { day: 'Ter', hour: '10:00', title: 'Nova Consulta (IA)', type: 'novo', animate: true };
                    // Reset if too many to avoid clutter, or just add one and stop
                    if (prev.find(a => a.day === 'Ter' && a.hour === '10:00')) {
                        return prev.filter(a => !(a.day === 'Ter' && a.hour === '10:00')); // clear it to animate again
                    }
                    return [...prev, newAppt];
                });
                setIsSimulating(false);
            }, 1500);
        }, 5000); // Repeat every 5 seconds for demonstration
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(21,93,252,0.15)] border border-slate-100 overflow-hidden transform transition-transform hover:-translate-y-1 duration-500">
            {/* Header Mockup */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#155dfc]/10 rounded-lg text-[#155dfc]">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Agenda Semanal</h4>
                        <p className="text-xs text-slate-500">Gerenciada por IA</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 text-xs font-medium text-[#155dfc] bg-[#155dfc]/10 px-3 py-1 rounded-full transition-opacity duration-300 ${isSimulating ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
                    <MessageSquare size={12} /> IA Agendando...
                </div>
            </div>
            
            {/* Grid */}
            <div className="p-4 overflow-hidden">
                <div className="grid grid-cols-[30px_repeat(5,1fr)] gap-2">
                    {/* Corner empty */}
                    <div className="text-[10px] text-slate-400 font-medium text-right pr-2 py-2">Hora</div>
                    {/* Days Header */}
                    {days.map(day => (
                        <div key={day} className="text-[11px] uppercase font-bold text-slate-600 text-center py-2 bg-slate-50 rounded-md">
                            {day}
                        </div>
                    ))}
                    
                    {/* Grid Cells */}
                    {hours.map(hour => (
                        <React.Fragment key={hour}>
                            <div className="text-[10px] text-slate-400 font-medium text-right pr-2 py-2 flex items-center justify-end">
                                {hour}
                            </div>
                            {days.map(day => {
                                const appt = appointments.find(a => a.day === day && a.hour === hour);
                                return (
                                    <div key={`${day}-${hour}`} className={`h-12 rounded-md border flex flex-col justify-center px-1.5 transition-all duration-500 relative group cursor-pointer ${appt ? (appt.type === 'novo' ? 'bg-[#155dfc] border-[#155dfc] shadow-lg shadow-[#155dfc]/30 z-10 scale-105' : 'bg-[#155dfc]/10 border-[#155dfc]/20 hover:bg-[#155dfc]/20') : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                                        {appt && (
                                            <div className={`${appt.animate ? 'animate-[popIn_0.5s_ease-out]' : ''}`}>
                                                <div className={`text-[9px] font-bold truncate leading-tight ${appt.type === 'novo' ? 'text-white' : 'text-[#155dfc]'}`}>
                                                    {appt.title}
                                                </div>
                                                <div className={`text-[8px] truncate mt-0.5 ${appt.type === 'novo' ? 'text-white/80' : 'text-[#155dfc]/70'}`}>
                                                    Via WhatsApp
                                                </div>
                                            </div>
                                        )}
                                        {!appt && (
                                            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center">
                                                <span className="text-xl text-slate-300 font-light">+</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

export default function LandingPage() {
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isMenuOpen])

    const toggleMenu = () => setIsMenuOpen(o => !o)
    const closeMenu = () => setIsMenuOpen(false)

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
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Inter',sans-serif] selection:bg-[#155dfc] selection:text-white overflow-x-hidden">
            
            {/* HEADER */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'bg-white/90 backdrop-blur-md py-3 border-b border-slate-100 shadow-sm' 
                        : 'bg-transparent py-5'
                }`}
            >
                <div className="max-w-[1488px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <img src='/blue_logo.svg' alt="Sched.ai" className="h-12 w-auto" />
                    </div>
                <div className='flex gap-8'>
                    <nav className="hidden md:flex gap-8 items-center font-semibold text-sm">
                        {['Solução', 'Monitoramento', 'Recursos'].map((item) => (
                            <a 
                                key={item} 
                                href={`#${item.toLowerCase()}`}
                                className="text-slate-600 hover:text-[#155dfc] transition-colors py-1"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <a 
                            href="#beta"
                            className="px-6 py-2.5 bg-[#155dfc] text-white rounded-lg font-bold text-sm hover:bg-[#104bce] transition-all transform hover:-translate-y-0.5"
                        >
                            Acesso Antecipado
                        </a>
                    </div>

                </div>
                    <button className="md:hidden text-slate-800 p-2" onClick={toggleMenu}>
                        <Menu size={28} />
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                    <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-800" onClick={closeMenu}>
                        <X size={32} />
                    </button>
                    {['Solução', 'Recursos', 'Monitoramento'].map((item) => (
                        <a 
                            key={item}
                            href={`#${item.toLowerCase()}`} 
                            onClick={closeMenu}
                            className="text-3xl font-extrabold text-slate-800 hover:text-[#155dfc] transition-colors"
                        >
                            {item}
                        </a>
                    ))}
                    <a 
                        href="#beta"
                        onClick={closeMenu}
                        className="px-8 py-4 mt-4 bg-[#155dfc] text-white rounded-xl font-bold text-lg w-3/4 text-center"
                    >
                        Acesso Antecipado
                    </a>
                </div>
            </header>

            {/* HERO */}
            <section id="solução" className="relative z-10 pt-36 pb-24 px-6 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#155dfc]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#155dfc]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-start relative z-10">
                    
                    {/* LEFT: Text Content */}
                    <div className="order-1 text-center lg:text-left animate-[fadeInUp_1s_ease-out]">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-slate-900 tracking-tight">
                            Agendamentos <br className="hidden md:block" />
                            <span className="text-[#155dfc]">inteligentes 24/7</span>
                        </h1>
                        <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Revolucione a gestão do seu negócio. Nossa Inteligência Artificial atende clientes, agenda horários, tira dúvidas e envia lembretes via WhatsApp automaticamente. Mais tempo para você, melhor experiência para o cliente.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#128c7e] font-semibold text-sm mb-6 border border-[#25D366]/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#25D366]">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                            </svg>
                            Integração Oficial Meta WhatsApp
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                            <a 
                                href="#beta" 
                                className="group relative px-8 py-4 bg-[#155dfc] text-white rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 w-full sm:w-auto text-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Teste Gratuitamente <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </a>
                            <a 
                                href="#recursos" 
                                className="px-8 py-4 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:border-[#155dfc]/30 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
                            >
                                <PlayCircle className="w-5 h-5 text-[#155dfc]" /> Como Funciona
                            </a>
                        </div>
                    </div>

                    {/* RIGHT: Hero Interactive Mockup */}
                    <div className="order-2 relative animate-[fadeIn_1.5s_ease-out]">
                        <InteractiveAgendaMockup />
                        
                        {/* Floating Element */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-[bounce_4s_infinite]">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Eficiência</p>
                                <p className="text-slate-800 font-bold text-sm">Respostas Imediatas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* MONITORING / SHOWCASE BANNER */}
            <section id="monitoramento" className="py-24 px-6 bg-[#fafbfc]">
                <div className="max-w-[1440px] mx-auto">
                    <FadeInSection>
                        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-800">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#155dfc]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                            
                            <div className="grid lg:grid-cols-2 items-center">
                                <div className="p-10 md:p-16 relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white font-semibold text-sm mb-6 border border-white/10 backdrop-blur-sm">
                                        <Activity size={16} /> Painel de Monitoramento
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
                                        Supervisão total na palma da sua mão.
                                    </h2>
                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                        Além da nossa agenda inteligente, oferecemos uma seção de monitoramento completa. Verifique as atividades do agente em tempo real e não perca nenhuma oportunidade de negócio.
                                    </p>
                                    <ul className="space-y-4 mb-8">
                                        {['Acompanhamento ao vivo de todos os chats', 'Responda diretamente pela plataforma', 'Assuma a conversa quando a IA atingir seus limites'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                                                <CheckCircle2 size={20} className="text-[#155dfc]" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="relative h-full min-h-[300px] lg:min-h-full bg-slate-800/50 p-6 flex items-center justify-center border-l border-slate-800">
                                    {/* Mockup Chat */}
                                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-[#155dfc]/20 text-[#155dfc] rounded-full flex items-center justify-center font-bold text-xs">C</div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Cliente #482</p>
                                                    <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> IA Atendendo</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 text-sm">
                                            <div className="self-end bg-[#155dfc]/10 text-slate-800 px-3 py-2 rounded-xl rounded-tr-sm max-w-[80%] text-xs border border-[#155dfc]/20">
                                                Olá! Temos o horário das 14h disponível amanhã. Posso agendar?
                                            </div>
                                            <div className="self-start bg-slate-100 text-slate-700 px-3 py-2 rounded-xl rounded-tl-sm max-w-[80%] text-xs">
                                                Pode sim, por favor!
                                            </div>
                                            <div className="self-end bg-[#155dfc]/10 text-slate-800 px-3 py-2 rounded-xl rounded-tr-sm max-w-[80%] text-xs border border-[#155dfc]/20">
                                                Tudo certo! Consulta agendada para amanhã às 14h.
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                disabled
                                                placeholder="Escreva uma mensagem..."
                                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-[12px] placeholder-slate-400 focus:outline-none focus:border-[#155dfc]"
                                                />
                                            <button
                                                disabled
                                                type="submit"
                                                className="px-3 py-2 rounded-full bg-[#155dfc] text-white text-sm font-semibold hover:bg-[#104bce] transition-colors"
                                                >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* FEATURES */}
            <section id="recursos" className="py-24 px-6 relative bg-white border-y border-slate-100 overflow-hidden">
                {/* Background Mockup */}
                <div className="absolute top-1/2 -translate-y-1/2 -right-[150px] lg:-right-[300px] w-[800px] lg:w-[1200px] opacity-20 pointer-events-none z-0">
                    <img src="/pc.png" alt="Sistema Sched" className="w-full h-auto object-contain" />
                </div>

                <div className="max-w-[1440px] mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[#155dfc] font-bold tracking-wider uppercase text-sm mb-3 block">Recursos Principais</span>
                        <h2 className="text-3xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Uma plataforma, múltiplas soluções.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Feature 1 */}
                        <FadeInSection>
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 h-full">
                                <div className="w-14 h-14 bg-[#155dfc]/10 text-[#155dfc] rounded-2xl flex items-center justify-center mb-6">
                                    <MessageSquare size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Atendimento via WhatsApp</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    Nossa IA conversa de forma natural, realizando novos agendamentos, cancelamentos e enviando lembretes automáticos diretamente no WhatsApp do seu negócio.
                                </p>
                            </div>
                        </FadeInSection>

                        {/* Feature 2 */}
                        <FadeInSection delay={100}>
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 h-full">
                                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Esclarecimento de Dúvidas</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    Personalize as respostas do agente. Ele é capaz de responder instantaneamente perguntas frequentes sobre serviços, locais de atendimento, horários e muito mais.
                                </p>
                            </div>
                        </FadeInSection>

                        {/* Feature 3 */}
                        <FadeInSection delay={200} className="md:col-span-2">
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 h-full">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div>
                                        <div className="w-14 h-14 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                            <FileText size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">Anotações e Evoluções</h3>
                                        <p className="text-slate-600 leading-relaxed mb-6">
                                            Temos a possibilidade de adicionar anotações em cada agendamento. Independentemente do seu negócio, você pode registrar o acompanhamento, salvar imagens e manter todo o histórico organizado em um só lugar.
                                        </p>
                                        <div className="flex gap-2 text-purple-600">
                                            <ImageIcon size={20} /> <FileText size={20} />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                            <div>
                                                <p className="font-bold text-sm">Registro de Evolução</p>
                                                <p className="text-xs text-slate-500">Agendamento #1024</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            Paciente apresentou melhora significativa. Recomendado manter o tratamento por mais duas semanas.
                                        </p>
                                        <div className="w-24 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                            <ImageIcon size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* BETA FORM */}
            <section id="beta" className="max-w-[1440px] mx-auto py-24 relative bg-[#f8fafc] border-y border-slate-100">
                <div className="">
                    <FadeInSection>
                        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 flex flex-col lg:flex-row min-h-[620px]">

                            {/* LEFT: Image + Text */}
                            <div
                                className="relative flex flex-col justify-between p-10 lg:p-14 lg:w-[50%] bg-cover bg-center"
                                style={{ backgroundImage: `url(${abstract})` }}
                            >

                                {/* Bottom text */}
                                <div className="relative z-10">
                                    <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300  font-bold text-xs rounded-full mb-5 border border-amber-400/30">BETA</span>
                                    <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                                        Transforme o seu<br />negócio com IA.
                                    </h2>
                                    <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-sm">
                                        Estamos liberando acessos limitados para empresas que querem automatizar seus agendamentos agora.
                                    </p>
                                    <ul className="space-y-3 mt-20">
                                        {[
                                            'Agendamentos automáticos 24/7',
                                            'Integração oficial com WhatsApp',
                                            'Painel de monitoramento completo',
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                                                <CheckCircle2 size={18} className="text-[#25D366] shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* RIGHT: Form */}
                            <div className="bg-white flex flex-col justify-center px-10 py-12 lg:px-14 lg:w-[50%]">
                                {!isFormSubmitted ? (
                                    <>
                                        <div className="mb-8">
                                            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                                                Solicitar acesso
                                            </h3>
                                            <p className="text-slate-500 text-sm">Preencha para garantir seu teste gratuito.</p>
                                        </div>
                                        <form className="space-y-5" onSubmit={onFormSubmit}>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155dfc] focus:ring-2 focus:ring-[#155dfc]/20 transition-all font-medium text-sm"
                                                    type="text"
                                                    required
                                                    placeholder="Ex: Carlos Eduardo"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700">E-mail Profissional</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155dfc] focus:ring-2 focus:ring-[#155dfc]/20 transition-all font-medium text-sm"
                                                    type="email"
                                                    required
                                                    placeholder="contato@seunegocio.com"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700">WhatsApp do Negócio</label>
                                                <input
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155dfc] focus:ring-2 focus:ring-[#155dfc]/20 transition-all font-medium text-sm"
                                                    type="tel"
                                                    placeholder="(00) 00000-0000"
                                                />
                                            </div>
                                            <button
                                                className={`w-full py-3.5 mt-2 bg-[#155dfc] text-white rounded-xl font-bold text-base hover:bg-[#104bce] hover:shadow-lg hover:shadow-[#155dfc]/30 transition-all flex justify-center items-center gap-2 ${loading ? 'opacity-80 cursor-wait' : ''}`}
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>Solicitar Acesso Beta <ChevronRight size={18} /></>
                                                )}
                                            </button>
                                            <p className="text-center text-xs text-slate-400 pt-1">
                                                Seus dados estão seguros e não serão compartilhados.
                                            </p>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-10 animate-[fadeIn_0.5s_ease-out]">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h4>
                                        <p className="text-slate-600 max-w-xs mx-auto text-sm">
                                            Seus dados foram registrados. Em breve entraremos em contato com as instruções para o seu teste gratuito.
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-slate-300 py-16">
                <div className="max-w-[1440px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 mb-12">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex items-center gap-2">
                                <img src='/logo.svg' alt="Sched.ai" className="h-16 w-auto brightness-200 contrast-0 grayscale md:grayscale-0 md:brightness-100 md:contrast-100" />
                            </div>
                            <p className="text-slate-400 text-sm max-w-[250px] text-center md:text-left">
                                Facilitando o agendamento através da inteligência artificial vinculada ao WhatsApp.
                            </p>
                        </div>
                        
                        <div className="flex gap-4">
                            {[
                                { Icon: Instagram, href: "#" },
                                { Icon: Facebook, href: "#" },
                                { Icon: Linkedin, href: "#" }
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#155dfc] hover:text-white transition-all duration-300">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 border-t border-slate-800 pt-10">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Legal</h4>
                            <nav className="flex flex-col gap-3 text-center md:text-left">
                                <span onClick={() => navigate('/politica-privacidade')} className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">Política de Privacidade</span>
                                <span onClick={() => navigate('/termos-uso')} className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">Termos de Uso</span>
                            </nav>
                        </div>
                    </div>
                
                    <div className="border-t border-slate-800 pt-8 text-center md:text-left text-slate-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© {new Date().getFullYear()} Sched AI. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
