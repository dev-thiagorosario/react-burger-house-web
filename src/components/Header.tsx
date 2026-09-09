import { Link, useLocation } from 'react-router'
import { Box, LayoutDashboard, LogOut, Plus, ShoppingCartPlus } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import logo from '../assets/logo.png'

const baseItemClassName =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-[#F2DAAC]/25 px-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2DAAC] disabled:cursor-not-allowed disabled:opacity-50'

const actionClassName = `${baseItemClassName} text-[#F2DAAC] hover:bg-[#F2DAAC]/10`

type HeaderProps = {
  userName?: string
  homePath?: string
  onCreateClick?: () => void
  onLogoutClick?: () => void
  isLoggingOut?: boolean
}

const Header = ({
  userName,
  homePath = '/home',
  onCreateClick,
  onLogoutClick,
  isLoggingOut = false,
}: HeaderProps) => {
  const location = useLocation()
  const { user } = useAuth()

  const getNavItemClass = (path: string) => {
    return location.pathname === path
      ? `${baseItemClassName} bg-[#F2DAAC] text-[#161410]`
      : actionClassName
  }

  return (
    <header className="border-b border-white/5 bg-[#161410]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link
          to={homePath}
          aria-label="Casa do Hambúrguer — início"
          className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2DAAC]"
        >
          <img src={logo} alt="" className="h-16 w-auto sm:h-20" />
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4 lg:order-3 lg:max-w-xs">
          {userName && (
            <p className="min-w-0 truncate text-right text-sm text-white sm:text-base" title={userName}>
              {userName}
            </p>
          )}
          <button
            type="button"
            onClick={onLogoutClick}
            disabled={isLoggingOut || !onLogoutClick}
            aria-label={isLoggingOut ? 'Encerrando sessão' : 'Sair'}
            aria-busy={isLoggingOut}
            title="Sair"
            className={`${actionClassName} shrink-0`}
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </div>

        {user?.isAdmin === true && (
          <nav aria-label="Ações principais" className="grid w-full grid-cols-4 gap-2 lg:order-2 lg:flex lg:w-auto lg:shrink-0">
            <Link
              to="/cardapio"
              aria-label="Cardápio"
              title="Cardápio"
              className={getNavItemClass('/cardapio')}
              aria-current={location.pathname === '/cardapio' ? 'page' : undefined}
            >
              <Box className="size-5 shrink-0" aria-hidden="true" />
              <span className="hidden text-sm sm:inline lg:hidden xl:inline">
                Cardápio
              </span>
            </Link>

            <Link
              to="/pedidos"
              aria-label="Pedidos"
              title="Pedidos"
              className={getNavItemClass('/pedidos')}
              aria-current={location.pathname === '/pedidos' ? 'page' : undefined}
            >
              <LayoutDashboard className="size-5 shrink-0" aria-hidden="true" />
              <span className="hidden text-sm sm:inline lg:hidden xl:inline">
                Pedidos
              </span>
            </Link>

            <button
              type="button"
              onClick={onCreateClick}
              disabled={!onCreateClick}
              aria-label="Adicionar produto"
              title="Adicionar produto"
              className={actionClassName}
            >
              <Plus className="size-5 shrink-0" aria-hidden="true" />
              <span className="hidden text-sm sm:inline lg:hidden xl:inline">
                Adicionar produto
              </span>
            </button>

            <Link
              to="/carrinhos"
              aria-label="Carrinho"
              title="Carrinho"
              className={getNavItemClass('/carrinhos')}
              aria-current={location.pathname === '/carrinhos' ? 'page' : undefined}
            >
              <ShoppingCartPlus className="size-5 shrink-0" aria-hidden="true" />
              <span className="hidden text-sm sm:inline lg:hidden xl:inline">
                Carrinho
              </span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
