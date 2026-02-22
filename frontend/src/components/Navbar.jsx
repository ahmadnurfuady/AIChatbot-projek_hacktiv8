import React from 'react';

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200">
                    C
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    ChatNex
                </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <a href="#" className="text-sm font-medium text-primary-600">Home</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">About</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Services</a>
                <div className="flex items-center gap-1 cursor-pointer group">
                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600 transition-colors">Pages</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 9l-7 7-7-7" />
                    </svg>
                </div>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Features</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
                <button className="hidden sm:block text-sm font-semibold text-gray-800 hover:text-primary-600 transition-colors">
                    Try Free Trial
                </button>
                <button className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-full hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-200 transition-all">
                    Contact Us
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
