import { useState } from 'react'
import Header from '../components/Header'
import CategoryTab from '../components/CategoryTab'
import Order from '../components/Order'
import { useAuth } from '../hooks/use-auth'

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'pickedUp', label: 'Retirados' },
  { id: 'cancelled', label: 'Cancelados' },
]

// Dados de demonstração enquanto a API de pedidos não está disponível.
const initialOrders = [
  {
    id: 1,
    userName: 'Mariana Santos',
    status: 'pending',
    date: '10/09/2026',
    orderedAt: '19:30',
    pickedUpAt: '',
    items: [
      { name: 'Burger da Casa', quantity: 2, price: 28.9 },
      { name: 'Batata frita', quantity: 1, price: 14.9 },
      { name: 'Coca-Cola 350 ml', quantity: 2, price: 6 },
    ],
  },
  {
    id: 2,
    userName: 'Lucas Oliveira',
    status: 'pickedUp',
    date: '10/09/2026',
    orderedAt: '19:10',
    pickedUpAt: '19:40',
    items: [
      { name: 'Cheddar Bacon', quantity: 1, price: 32.9 },
      { name: 'Batata frita', quantity: 1, price: 14.9 },
      { name: 'Suco de laranja', quantity: 1, price: 8 },
    ],
  },
  {
    id: 3,
    userName: 'Ana Clara Souza',
    status: 'cancelled',
    date: '10/09/2026',
    orderedAt: '18:50',
    pickedUpAt: '',
    items: [
      { name: 'Burger Clássico', quantity: 1, price: 24.9 },
      { name: 'Coca-Cola 350 ml', quantity: 1, price: 6 },
    ],
  },
]

const Orders = () => {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [orders, setOrders] = useState(initialOrders)
  const visibleOrders = orders.filter(
    (order) => selectedCategory === 'all' || order.status === selectedCategory,
  )

  function handleStatusChange(orderId, status) {
    setOrders((currentOrders) => currentOrders.map((order) => (
      order.id === orderId
        ? { ...order, status, pickedUpAt: status === 'pickedUp' ? order.pickedUpAt || '20:00' : '' }
        : order
    )))
  }

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setLogoutError('')

    try {
      await logout()
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Não foi possível sair. Tente novamente.',
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <Header
        userName={user?.fullName}
        onLogoutClick={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="pt-8">
          <h1 className="text-2xl font-bold text-[#FFF7E8] sm:text-3xl">Pedidos</h1>
          <p className="mt-2 text-sm text-[#C5BDAF]">Acompanhe os itens e atualize o status de cada pedido.</p>
          <p className="mt-2 text-xs text-[#C5BDAF]">Pedidos de exemplo · alterações válidas até recarregar a página.</p>
        </div>
        <div
          role="group"
          aria-label="Status dos pedidos"
          className="flex flex-wrap gap-3 py-6"
        >
          {categories.map((category) => (
            <CategoryTab
              key={category.id}
              label={category.label}
              isSelected={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleOrders.map((order) => (
            <Order
              key={order.id}
              {...order}
              onStatusChange={(status) => handleStatusChange(order.id, status)}
            />
          ))}
        </div>
        {visibleOrders.length === 0 && (
          <p role="status" className="rounded-2xl border border-[#F2DAAC]/15 py-12 text-center text-[#C5BDAF]">
            Nenhum pedido com este status.
          </p>
        )}

        {logoutError && (
          <p role="alert" className="py-3 text-sm text-red-300">
            {logoutError}
          </p>
        )}
      </main>
    </>
  )
}

export default Orders

