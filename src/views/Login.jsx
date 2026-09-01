import { useState } from 'react'
import logo from '../assets/logo.png'
import Button from '../components/Button'
import Input from '../components/Input'
import { useNavigate } from 'react-router'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    // A chamada de autenticação pode ser feita aqui usando email e password.
  }

  return (
    <main className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-[#161410] px-4 py-8 sm:min-h-[calc(100svh-5rem)] sm:px-6 sm:py-10 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-[#d9290f]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-[#F2DAAC]/10 blur-3xl"
      />

      <section className="mx-auto grid w-full max-w-[960px] overflow-hidden rounded-3xl border border-white/10 bg-[#0d0c0a] shadow-2xl shadow-black/40 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[560px] overflow-hidden bg-[#F2DAAC] p-10 lg:flex lg:flex-col xl:p-12">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full border-[48px] border-[#d9290f]/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-[#d9290f]/10"
          />

          <div className="relative inline-flex w-fit">
            <div
              aria-hidden="true"
              className="absolute inset-5 rounded-full bg-[#d9290f]/20 blur-2xl"
            />
            <img
              src={logo}
              alt="Casa do Hambúrguer"
              className="relative h-28 w-auto drop-shadow-xl xl:h-32"
            />
          </div>

          <div className="relative mt-auto">
            <p className="mb-3 text-sm font-bold tracking-[0.2em] text-[#d9290f] uppercase">
              A casa é sua
            </p>
            <h1 className="text-4xl leading-tight font-bold text-[#161410] xl:text-5xl">
              Que bom ter você de volta.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#161410]/70">
              Entre e continue de onde parou. Seu próximo pedido está mais
              perto do que você imagina.
            </p>
          </div>
        </div>

        <div
          aria-labelledby="login-title"
          className="flex flex-col justify-center p-5 sm:p-10 lg:p-12"
        >
          <header>
            <div className="relative mx-auto mb-6 flex w-fit justify-center lg:hidden">
              <div
                aria-hidden="true"
                className="absolute inset-4 rounded-full bg-[#d9290f]/20 blur-2xl"
              />
              <img
                src={logo}
                alt="Casa do Hambúrguer"
                className="relative h-20 w-auto drop-shadow-xl sm:h-24"
              />
            </div>

            <p className="text-sm font-semibold text-[#d9290f]">
              Bem-vindo de volta
            </p>
            <h2 id="login-title" className="mt-1 text-2xl font-bold text-[#F2DAAC] sm:text-3xl">
              Acesse sua conta
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
              Informe seu e-mail e sua senha para continuar.
            </p>
          </header>

          <form className="mx-auto mt-8 flex w-full max-w-[400px] flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/85" htmlFor="login-email">
                E-mail
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/85" htmlFor="login-password">
                Senha
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <Button
                type="submit"
                backgroundColor="#d9290f"
                textColor="#ffffff"
                borderColor="#d9290f"
              >
                Login
              </Button>

              <Button
                type="button"
                backgroundColor="#ffffff"
                textColor="#d9290f"
                borderColor="#d9290f"
                onClick={() => navigate('/register')}
              >
                Não tenho uma conta
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Login
