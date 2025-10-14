'use client';

import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#043915] text-[#FFFD8F] w-full">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center md:items-start justify-between space-y-8 md:space-y-0 md:gap-8">
        {/* About */}
        <div className="flex-1 w-full md:w-auto text-center md:text-left">
          <h2 className="text-2xl font-bold text-[#B0CE88] mb-2">Foodies Heaven</h2>
          <p className="text-sm text-[#FFFD8F]/80">
            Discover and share delicious recipes from around the world. Our mission is to make cooking fun, simple, and flavorful!
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex-1 w-full md:w-auto text-center md:text-left">
          <h3 className="text-xl font-semibold text-[#B0CE88] mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-[#FFFD8F] transition-colors duration-200">Home</Link>
            </li>
            <li>
              <Link href="/recipes" className="hover:text-[#FFFD8F] transition-colors duration-200">Recipes</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[#FFFD8F] transition-colors duration-200">About</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#FFFD8F] transition-colors duration-200">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="flex-1 w-full md:w-auto text-center md:text-left">
          <h3 className="text-xl font-semibold text-[#B0CE88] mb-2">Follow Us</h3>
          <div className="flex justify-center md:justify-start gap-4 text-[#FFFD8F]">
            <a href="#" className="hover:text-[#B0CE88] transition-colors duration-200"><FaFacebookF size={20} /></a>
            <a href="#" className="hover:text-[#B0CE88] transition-colors duration-200"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-[#B0CE88] transition-colors duration-200"><FaTwitter size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#B0CE88]/30 mt-4 py-2 text-center text-sm text-[#FFFD8F]/70">
        &copy; {new Date().getFullYear()} Foodies Heaven. All rights reserved.
      </div>
    </footer>
  );
}
