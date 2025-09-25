"use client";
import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, Database } from "lucide-react";

const Banner = () => {
  return (
    <div className="relative pt-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 bg-gradient-to-r from-blue-400/30 to-blue-500/90 p-8 rounded-2xl border border-blue-400/30"
        >
          <h1
            style={{ fontFamily: "orbitron, sans-serif" }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Data Marketplace
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover, contribute, and Earn by sharing high-quality data for AI
            training
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search datasets, contributors, or categories..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/25"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </motion.button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["Computer Vision", "NLP", "Audio", "Time Series", "Tabular"].map(
              (category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg text-sm border border-gray-600 transition-all duration-200"
                >
                  {category}
                </motion.button>
              )
            )}
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Contribute Card */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-500/30 transition-all duration-300">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Contribute Data
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Share your datasets and earn rewards from the community
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Start Contributing
            </motion.button>
          </div>

          {/* Discover Card */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6 hover:border-green-400/50 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-500/30 transition-all duration-300">
                <Search className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Discover Data
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Find high-quality datasets for your AI training needs
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Explore Datasets
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
      <div className="absolute top-1/4 right-20 w-16 h-16 bg-purple-500/10 rounded-full animate-bounce"></div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-green-500/10 rounded-full animate-pulse"></div>
    </div>
  );
};

export default Banner;
