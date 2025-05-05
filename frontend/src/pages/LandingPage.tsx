import { useNavigate } from 'react-router-dom'
import logo from '/src/assets/logo/Epay.png'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex-shrink-0 mx-4 flex justify-center mb-6">
          <img
            src={logo}
            alt="Company Logo"
            className="w-[200px] h-[200px] object-contain"
          />
        </div>
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