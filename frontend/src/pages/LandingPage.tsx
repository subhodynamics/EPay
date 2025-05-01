import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to ePay</h1>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-gray-200 text-black py-2 px-4 rounded hover:bg-gray-300 transition-colors"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}