import { useState } from 'react'
import logo from '../assets/logo.png'
import Button from '../components/Button'
import Input from '../components/Input'
import { useNavigate } from 'react-router'

const Register = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cep, setCep] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }

    setPasswordError('')

    // A chamada de cadastro pode ser feita aqui.
  }

  return (
    <main className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[#161410] px-4 py-8 sm:min-h-[calc(100svh-5rem)] sm:px-6 sm:py-10 lg:flex lg:items-center lg:px-8">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-1/4 -z-10 h-80 w-80 rounded-full bg-[#d9290f]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-[#F2DAAC]/5 blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16 xl:gap-24">
        <section className="hidden max-w-xl lg:block" aria-labelledby="register-intro-title">
          <div className="relative mb-8 inline-flex">
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-full bg-[#d9290f]/20 blur-3xl"
            />
            <img
              src={logo}
              alt="Casa do Hambúrguer"
              className="relative h-32 w-auto drop-shadow-2xl xl:h-36"
            />
          </div>

          <p className="mb-4 text-sm font-bold tracking-[0.2em] text-[#d9290f] uppercase">
            Bem-vindo à Casa
          </p>
          <h1
            id="register-intro-title"
            className="text-4xl leading-tight font-bold text-[#F2DAAC] xl:text-5xl"
          >
            Seu próximo hambúrguer começa aqui.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
            Crie sua conta para fazer pedidos com mais rapidez e aproveitar uma
            experiência feita do seu jeito.
          </p>

          <ul className="mt-8 grid gap-4 text-white/85">
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9290f] text-sm font-bold text-white">
                ✓
              </span>
              Salve seus dados para os próximos pedidos
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9290f] text-sm font-bold text-white">
                ✓
              </span>
              Acompanhe seus pedidos com facilidade
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9290f] text-sm font-bold text-white">
                ✓
              </span>
              Tenha uma experiência mais personalizada
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="register-title"
          className="w-full max-w-[480px] justify-self-center rounded-2xl border border-white/10 bg-[#0d0c0a]/95 p-5 shadow-2xl shadow-black/30 sm:p-8 lg:justify-self-end lg:p-9"
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

            <p className="text-sm font-semibold text-[#d9290f] lg:hidden">
              Bem-vindo à Casa
            </p>
            <h2 id="register-title" className="mt-1 text-2xl font-bold text-[#F2DAAC] sm:text-3xl">
              Crie sua conta
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
              Preencha seus dados para começar.
            </p>
          </header>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/85" htmlFor="full-name">
                Nome completo
              </label>
              <Input
                id="full-name"
                name="fullName"
                type="text"
                placeholder="Digite seu nome"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/85" htmlFor="register-email">
                E-mail
              </label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/85" htmlFor="register-password">
                  Senha
                </label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/85" htmlFor="confirm-password">
                  Confirmar senha
                </label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {passwordError && (
              <p id="password-error" className="-mt-2 text-sm text-red-400" role="alert">
                {passwordError}
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/85" htmlFor="cep">
                CEP
              </label>
              <Input
                id="cep"
                name="cep"
                type="text"
                placeholder="00000-000"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={9}
                value={cep}
                onChange={(event) => setCep(event.target.value)}
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
                Criar conta
              </Button>

              <Button
                type="button"
                backgroundColor="#ffffff"
                textColor="#d9290f"
                borderColor="#d9290f"
                onClick={() => navigate('/login')}
              >
                Já tenho uma conta
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Register
