import logo from '../assets/logo.png'

const Header = () => {
  return (
    <header className="bg-[#161410]">
      <div className="w-full max-w-[737px] mx-auto px-4 md:px-0 flex items-center justify-between gap-4" >
        <img src={logo} alt="Casa do Hambúrguer" className="h-16 sm:h-20 w-auto" />
        <button type="button" className="bg-[#F2DAAC] w-[120px] sm:w-[130px] h-[35px] shrink-0 flex items-center justify-center rounded-sm cursor-pointer" >
          Order Now
        </button>
      </div>
    </header>
  )
}

export default Header
