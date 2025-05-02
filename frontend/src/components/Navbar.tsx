import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo/Epay.png';

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const goToHome = () => {
        navigate('/home');
    };

    return (
        <nav className="bg-white shadow-lg h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
                {/* Home Button */}
                <button
                    onClick={goToHome}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label="Go to Home"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    <span>Home</span>
                </button>

                {/* Logo */}
                <div className="flex-shrink-0 mx-4 flex items-center">
                    <img
                        src={logo}
                        alt="Company Logo"
                        className="w-[150px] h-[150px] object-contain"
                    />
                </div>

                {/* Right Side - Logout */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-800 px-4 py-2 rounded hover:bg-red-50 focus:outline-none"
                        aria-label="Logout"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
