import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 py-8">
                {children}
            </main>
            <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                    <p>&copy; {new Date().getFullYear()} AlumNexus. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
