import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import CategoryTab from '../components/CategoryTab'
import Order from '../components/Order'
import ProductFormModal from '../form/ProductFormModal'
import { useAuth } from '../hooks/use-auth'
import { useCart } from '../hooks/use-cart'
import { listOrders, listOrderStatuses, updateOrderStatus } from '../services/order-service'

const statusLabels = {
  pending: 'Pendentes',
  pickedUp: 'Retirados',
  cancelled: 'Cancelados',
}

const Orders = () => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const { user, logout } = useAuth()
  const { ordersVersion } = useCart()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [orders, setOrders] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [ordersAttempt, setOrdersAttempt] = useState(0)
  const [updatingOrders, setUpdatingOrders] = useState({})
  const [statusErrors, setStatusErrors] = useState({})
  const pendingUpdates = useRef(new Set())

  useEffect(() => {
    let active = true

    async function loadOrders() {
      setLoadingOrders(true)
      setOrdersError('')

      try {
        const [nextOrders, nextStatuses] = await Promise.all([listOrders(), listOrderStatuses()])
        if (active) {
          setOrders((currentOrders) => {
            const currentById = new Map(currentOrders.map((order) => [order.id, order]))
            return nextOrders.map((order) => {
              const current = currentById.get(order.id)
              return current && Date.parse(current.updatedAt) > Date.parse(order.updatedAt) ? current : order
            })
          })
          setStatuses(nextStatuses)
        }
      } catch (error) {
        if (active) setOrdersError(error instanceof Error ? error.message : 'Não foi possível carregar os pedidos.')
      } finally {
        if (active) setLoadingOrders(false)
      }
    }

    loadOrders()
    return () => { active = false }
  }, [ordersAttempt, ordersVersion, user?.id])

  const categories = [
    { id: 'all', label: 'Todos' },
    ...statuses.map((status) => ({ id: status.id, label: statusLabels[status.name] ?? status.name })),
  ]
  const selectedStatus = statuses.find((status) => status.id === selectedCategory)
  const visibleOrders = orders.filter(
    (order) => selectedCategory === 'all' || order.status === selectedStatus?.name,
  )

  function retryOrders() {
    setOrdersError('')
    setStatusErrors({})
    setLoadingOrders(true)
    setOrdersAttempt((attempt) => attempt + 1)
  }

  async function handleStatusChange(orderId, statusId) {
    const order = orders.find((current) => current.id === orderId)
    const nextStatus = statuses.find((status) => status.id === statusId)
    if (user?.isAdmin !== true || pendingUpdates.current.has(orderId) ||
      !order || order.status !== 'pending' || !nextStatus || nextStatus.name === order.status) return

    pendingUpdates.current.add(orderId)
    setUpdatingOrders((current) => ({ ...current, [orderId]: true }))
    setStatusErrors((current) => ({ ...current, [orderId]: '' }))

    try {
      const updatedOrder = await updateOrderStatus(orderId, statusId)
      setOrders((currentOrders) => currentOrders.map((current) => current.id === orderId ? updatedOrder : current))
    } catch (error) {
      setStatusErrors((current) => ({
        ...current,
        [orderId]: error instanceof Error ? error.message : 'Não foi possível atualizar o status do pedido.',
      }))
    } finally {
      pendingUpdates.current.delete(orderId)
      setUpdatingOrders((current) => ({ ...current, [orderId]: false }))
    }
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
        onCreateClick={() => setIsProductModalOpen(true)}
      />

      <main tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="pt-8">
          <h1 className="text-2xl font-bold text-[#FFF7E8] sm:text-3xl">Pedidos</h1>
          <p className="mt-2 text-sm text-[#C5BDAF]">
            {user?.isAdmin === true ? 'Acompanhe os itens e atualize o status de cada pedido.' : 'Acompanhe os itens e o status dos seus pedidos.'}
          </p>
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

        {loadingOrders && <p role="status" className="py-6 text-[#C5BDAF]">Carregando pedidos...</p>}
        {ordersError && (
          <div role="alert" className="space-y-3 py-6 text-red-300">
            <p>{ordersError}</p>
            <button type="button" onClick={retryOrders} className="min-h-11 cursor-pointer rounded-lg border border-[#F2DAAC]/40 px-4 text-[#F2DAAC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2DAAC]">
              Tentar novamente
            </button>
          </div>
        )}
        {!loadingOrders && !ordersError && <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleOrders.map((order) => (
            <Order
              key={order.id}
              {...order}
              statuses={statuses}
              canUpdateStatus={user?.isAdmin === true}
              isUpdating={updatingOrders[order.id] === true}
              statusError={statusErrors[order.id] ?? ''}
              onStatusChange={(statusId) => handleStatusChange(order.id, statusId)}
            />
          ))}
        </div>}
        {!loadingOrders && !ordersError && visibleOrders.length === 0 && (
          <p role="status" className="rounded-2xl border border-[#F2DAAC]/15 py-12 text-center text-[#C5BDAF]">
            {selectedCategory === 'all' ? 'Nenhum pedido encontrado.' : 'Nenhum pedido com este status.'}
          </p>
        )}

        {logoutError && (
          <p role="alert" className="py-3 text-sm text-red-300">
            {logoutError}
          </p>
        )}
      </main>
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </>
  )
}

export default Orders
