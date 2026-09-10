import { Navigate, createBrowserRouter } from 'react-router'
import App from '../App'
import AuthRoute from '../components/AuthRoute'
import Home from '../views/Home'
import Orders from '../views/Orders'
import Login from '../views/Login'
import Register from '../views/Register'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/home" replace />,
      },
      {
        element: <AuthRoute guestOnly />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
        ],
      },
      {
        element: <AuthRoute />,
        children: [
          { path: '/home', element: <Home /> },
          { path: '/pedidos', element: <Orders /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

export default router
