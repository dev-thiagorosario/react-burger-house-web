import { Navigate, createBrowserRouter } from 'react-router'
import App from '../App'
import Login from '../views/Login'
import Register from '../views/Register'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
])

export default router
