import { getJson } from './api-client.js'

export async function listCategories() {
  const payload = await getJson('/list-categories', 'Não foi possível carregar as categorias.')
  const categories = payload?.data?.categories

  if (payload?.success !== true || !Array.isArray(categories) || categories.some((category) =>
    !category || !Number.isInteger(category.id) || category.id <= 0 ||
    typeof category.name !== 'string' || !category.name.trim(),
  )) {
    throw new Error('O servidor retornou uma resposta de categorias inválida.')
  }

  return categories.map(({ id, name }) => ({ id, name }))
}
