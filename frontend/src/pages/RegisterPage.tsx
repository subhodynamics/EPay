import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserRegisterData } from '../types'
import logo from '/src/assets/logo/Epay.png'

export default function Register() {
  const [formData, setFormData] = useState<UserRegisterData>({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('https://epaybackend.subhadeep.in/auth/register', formData)
      // local test -> comment out and use (uncomment before pushing)
      // await axios.post('http://localhost:3000/auth/register', formData)
      navigate('/login')
    } catch (error) {
      setError('Registration failed. Please try again.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="admin">Admin</option>
              <option value="school_staff">School Staff</option>
              <option value="trustee">Trustee</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create Account
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:underline"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  )
}