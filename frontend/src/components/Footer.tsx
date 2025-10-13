'use client';

import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#043915] text-[#FFFD8F]">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-8">
        {/* About */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#B0CE88] mb-4">Foodies Heaven</h2>
          <p className="text-sm text-[#FFFD8F]/80">
            Discover and share delicious recipes from around the world. Our mission is to make cooking fun, simple, and flavorful!
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-[#B0CE88] mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-[#FFFD8F] transition-colors duration-200">Home</a>
            </li>
            <li>
              <a href="/recipes" className="hover:text-[#FFFD8F] transition-colors duration-200">Recipes</a>
            </li>
            <li>
              <a href="/about" className="hover:text-[#FFFD8F] transition-colors duration-200">About</a>
            </li>
            <li>
              <a href="/contact" className="hover:text-[#FFFD8F] transition-colors duration-200">Contact</a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-[#B0CE88] mb-4">Follow Us</h3>
          <div className="flex gap-4 text-[#FFFD8F]">
            <a href="#" className="hover:text-[#B0CE88] transition-colors duration-200"><FaFacebookF size={20} /></a>
            <a href="#" className="hover:text-[#B0CE88] transition-colors duration-200"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-[#B0CE88] transition-colors duration-200"><FaTwitter size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#B0CE88]/30 mt-8 py-4 text-center text-sm text-[#FFFD8F]/70">
        &copy; {new Date().getFullYear()} Foodies Heaven. All rights reserved.
      </div>
    </footer>
  );
}
