"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Tag } from 'lucide-react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <Tag size={24} color="var(--bg-secondary)" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900" style={{ color: 'var(--brand-primary)' }}>
                        쿠폰톡
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 font-medium">
                    <Link href="/category/travel" className="hover:text-blue-600 transition-colors">호텔·항공권</Link>
                    <Link href="/category/fashion" className="hover:text-blue-600 transition-colors">명품·패션</Link>
                    <Link href="/category/electronics" className="hover:text-blue-600 transition-colors">전자제품</Link>
                    <Link href="/category/health" className="hover:text-blue-600 transition-colors">건강식품</Link>
                </nav>

                {/* Action Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100 rounded-full">
                        <Search size={20} />
                    </button>
                    <Link href="/about" className="btn-primary">
                        제휴/문의
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-gray-800"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 p-4 flex flex-col gap-4 md:hidden">
                    <Link href="/category/travel" className="w-full text-left p-3 hover:bg-blue-50 rounded-lg">호텔·항공권</Link>
                    <Link href="/category/fashion" className="w-full text-left p-3 hover:bg-blue-50 rounded-lg">명품·패션</Link>
                    <Link href="/category/electronics" className="w-full text-left p-3 hover:bg-blue-50 rounded-lg">전자제품</Link>
                    <Link href="/category/health" className="w-full text-left p-3 hover:bg-blue-50 rounded-lg">건강식품</Link>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <Link href="/about" className="btn-primary w-full text-center py-3">
                        제휴/문의
                    </Link>
                </div>
            )}
        </header>
    );
}
