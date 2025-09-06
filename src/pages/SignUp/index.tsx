import { Button } from "../../components/ui/button"
import abstract from "../../assets/abstract_signup.png"
import { Eye } from "lucide-react"

export const SignUp = () => {
	return (
		<div className="min-h-screen flex bg-[#fafafa]">
			<div className="flex p-11 max-w-[640px] w-full bg-cover bg-center" style={{ backgroundImage: `url(${abstract})` }}>
				<div className="flex flex-col justify-between">
					<div>
					    <h1 className="text-4xl font-semibold text-white italic">SCHED</h1>
					</div>
					<div>
                        <h2 className="text-4xl font-light text-white">Já possui uma conta?</h2>
                        <h2 className="text-4xl font-semibold text-white max-w-[290px] mb-10">Bem vindo de volta!</h2>
                        <Button variant="seccondary" className="w-full" onClick={() => {
                            window.location.href = '/signin'
                        }}>LOGIN</Button>
                    </div>
				</div>
                <div className="flex-1 flex items-center justify-center p-8">
                    
                </div>
		    </div>
            <div className="w-full max-w-md m-auto">
                <form className="space-y-6">
                    <div className="text-start">
                        <h1 className="text-[40px] font-semibold">Crie sua conta</h1>
                        <p>Ou cadastre um novo usuário</p>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            placeholder="scheapp@gmail.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                required
                                placeholder="Insira sua senha"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-12"
                            />
                            <Button
                                type="button"
                                variant='ghost'
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <Eye />
                            </Button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        CADASTRAR
                    </Button>

                    <div className="text-center">
                        <span className="text-gray-600">Já Possui Uma Conta? </span>
                        <Button variant="link" onClick={() => {
                            window.location.href = '/signin'
                        }}>Login</Button>
                    </div>
                </form>
            </div>
		</div>
	)
}
