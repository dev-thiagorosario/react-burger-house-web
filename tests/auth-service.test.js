import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { login, getCurrentUser } from '../src/services/auth-service.js'

const originalFetch = globalThis.fetch
const user = { id: '123', fullName: 'Maria Silva', email: 'maria@example.com', cep: '40000000' }
afterEach(() => { globalThis.fetch = originalFetch })

test('login aceita resposta sem JWT e envia credentials', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/login'))
    assert.equal(options.credentials, 'include')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), { email: user.email, password: 'example' })
    assert.equal(options.headers.Authorization, undefined)
    return Response.json({ success: true, data: { user } })
  }
  assert.deepEqual(await login({ email: user.email, password: 'example' }), { user, message: undefined })
})

test('restaura usuário via GET com cookie e sem cache', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/auth/me'))
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    return Response.json({ success: true, data: { user: { ...user, password: 'private' } } })
  }
  assert.deepEqual(await getCurrentUser(), user)
})

test('preserva 401 para distinguir sessão ausente de falha no servidor', async () => {
  globalThis.fetch = async () => Response.json({ message: 'Unauthorized' }, { status: 401 })
  await assert.rejects(getCurrentUser(), { status: 401 })
})

test('preserva erros de validação do login', async () => {
  const errors = [{ field: 'email', message: 'E-mail inválido.' }]
  globalThis.fetch = async () => Response.json({ errors }, { status: 400 })
  await assert.rejects(login({}), { status: 400, issues: errors, message: 'E-mail inválido.' })
})

test('falha de rede não é tratada como 401', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(getCurrentUser(), { status: null, name: 'ApiRequestError' })
})

test('rejeita resposta de autenticação incompleta', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: {} })
  await assert.rejects(login({}), /resposta de autenticação inválida/)
})
