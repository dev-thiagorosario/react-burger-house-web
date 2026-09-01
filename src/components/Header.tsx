import logo from '../assets/logo.png'

const Header = () => {
  return (
    <header className="border-b border-white/5 bg-[#161410]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <img src={logo} alt="Casa do Hambúrguer" className="h-16 w-auto sm:h-20" />
        <button
          type="button"
          className="flex h-9 w-[112px] shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#F2DAAC] text-sm font-semibold transition-opacity hover:opacity-90 sm:h-10 sm:w-[130px] sm:text-base"
        >
          Order Now
        </button>
      </div>
    </header>
  )
}

export default Header
