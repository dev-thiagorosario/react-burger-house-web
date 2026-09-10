import { useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../hooks/use-auth'
import CategoryTab from '../components/CategoryTab'
import Product from '../components/Product'
import SectionTitle from '../components/SectionTitle'

const products = []

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'burgers', label: 'Hambúrgueres' },
  { id: 'drinks', label: 'Bebidas' },
  { id: 'sides', label: 'Porções' },
]

const Home = () => {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const visibleSections = categories
    .filter((category) => category.id !== 'all')
    .filter((category) => selectedCategory === 'all' || category.id === selectedCategory)
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.category === category.id),
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
        <div className="space-y-10">
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
                    title={product.title}
                    description={product.description}
                    image={product.image}
                    mobileImage={product.mobileImage}
                    imageAlt={product.imageAlt}
                    price={product.price}
                  />
                ))}
              </div>

            </section>
          ))}
        </div>

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
