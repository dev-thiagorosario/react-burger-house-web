import { Outlet } from 'react-router'
import CartProvider from './cart/CartProvider'
import { useAuth } from './hooks/use-auth'

const App = () => {
  const { user } = useAuth()
  return <CartProvider key={user?.id ?? 'guest'}><Outlet /></CartProvider>
}

export default App
