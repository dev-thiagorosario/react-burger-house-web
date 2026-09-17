import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../hooks/use-auth'
import CategoryTab from '../components/CategoryTab'
import Product from '../components/Product'
import SectionTitle from '../components/SectionTitle'
import { listProducts } from '../services/product-service'

const menuCategories = [
  { id: 'all', label: 'Todos' },
  { id: 1, label: 'Hambúrgueres' },
  { id: 3, label: 'Bebidas' },
  { id: 2, label: 'Porções' },
]

const Home = () => {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [productsAttempt, setProductsAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const result = await listProducts()
        if (active) setProducts(result)
      } catch (error) {
        if (active) setProductsError(error instanceof Error ? error.message : 'Não foi possível carregar o cardápio.')
      } finally {
        if (active) setLoadingProducts(false)
      }
    }

    loadProducts()
    return () => { active = false }
  }, [productsAttempt])

  function retryProducts() {
    setProductsError('')
    setLoadingProducts(true)
    setProductsAttempt((attempt) => attempt + 1)
  }

  const categories = [
    ...menuCategories,
    ...[...new Set(products.map((product) => product.categoryId))]
      .filter((id) => !menuCategories.some((category) => category.id === id))
      .sort((a, b) => a - b)
      .map((id) => ({ id, label: `Categoria ${id}` })),
  ]

  const visibleSections = categories
    .filter((category) => category.id !== 'all')
    .filter((category) => selectedCategory === 'all' || category.id === selectedCategory)
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.categoryId === category.id),
    }))
    .filter((section) => section.products.length > 0)

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
        <div
          role="group"
          aria-label="Categorias do cardápio"
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

        <h1 className="sr-only">Cardápio</h1>
        {loadingProducts && <p role="status" className="py-6 text-[#C5BDAF]">Carregando cardápio...</p>}
        {productsError && (
          <div role="alert" className="space-y-3 py-6 text-red-300">
            <p>{productsError}</p>
            <button type="button" onClick={retryProducts} className="min-h-11 cursor-pointer rounded-lg border border-[#F2DAAC]/40 px-4 text-[#F2DAAC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2DAAC]">
              Tentar novamente
            </button>
          </div>
        )}
        {!loadingProducts && !productsError && visibleSections.length === 0 && (
          <p role="status" className="py-6 text-[#C5BDAF]">
            {selectedCategory === 'all' ? 'Nenhum produto disponível no momento.' : 'Nenhum produto disponível nesta categoria.'}
          </p>
        )}
        {!loadingProducts && !productsError && <div className="space-y-10">
          {visibleSections.map((section) => (
            <section key={section.id} aria-labelledby={`category-${section.id}`}>
              <SectionTitle
                id={`category-${section.id}`}
                title={section.label}
                count={section.products.length}
              />

              <div className="grid grid-cols-1 gap-5">
                {section.products.map((product) => (
                  <Product
                    key={product.id}
                    title={product.name}
                    description={product.description}
                    image={product.imageUrl}
                    mobileImage={product.mobileImageUrl}
                    imageAlt={product.imageAlt}
                    price={product.price}
                  />
                ))}
              </div>

            </section>
          ))}
        </div>}

        {logoutError && (
          <p role="alert" className="py-3 text-sm text-red-300">
            {logoutError}
          </p>
        )}
      </main>
    </>
  )
}

export default Home
