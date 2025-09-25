import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black/50 border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <span
              className="text-xl font-bold text-white"
              style={{ fontFamily: "orbitron, sans-serif" }}
            >
              Dallnk
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              Terms
            </a>
            <a
              href="https://filecoin.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
            >
              Powered by Filecoin
            </a>
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-sm">
            © 2024 Dallnk. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
