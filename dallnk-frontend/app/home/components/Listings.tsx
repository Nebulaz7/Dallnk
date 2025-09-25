"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Upload,
  X,
  Calendar,
  User,
  Coins,
  FileType,
  HardDrive,
} from "lucide-react";
import Image from "next/image";

// Skeleton Loading Component
const ListingSkeleton = () => {
  return (
    <div className="mt-8 p-6 bg-gray-900/50 border border-gray-700 rounded-2xl animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
      </div>
      <div className="h-10 bg-gray-700 rounded w-32"></div>
    </div>
  );
};

// Sample data for listings
const sampleListings = [
  {
    id: 1,
    title: "Differentiate between ripe and unripe plantain",
    creator: "0x3dummy..56",
    description:
      "A comprehensive dataset of high-resolution images capturing the subtle differences between ripe and unripe plantains in various lighting conditions and angles. Perfect for training computer vision models to accurately classify plantain ripeness.",
    date: "15/06/2025",
    submissions: { current: 1, max: 100 },
    rewards: "6 FIL Tokens per High data",
    format: "Images (JPEG, PNG)",
    maxSize: "5MB",
    image: "/listing-placeholder.svg",
  },
  {
    id: 2,
    title: "Natural Language Processing for Social Media",
    creator: "0x7abc..123",
    description:
      "Curated collection of social media posts with sentiment analysis labels. Includes tweets, Facebook posts, and Instagram captions with corresponding emotional tags and engagement metrics.",
    date: "12/06/2025",
    submissions: { current: 45, max: 200 },
    rewards: "4 FIL Tokens per submission",
    format: "JSON, CSV",
    maxSize: "2MB",
    image: "/listing-placeholder.svg",
  },
];

// Submission Modal Component
const SubmissionModal = ({ isOpen, onClose, listing }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState("");

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log("Submitting:", { files: selectedFiles, description, listing });
    onClose();
    setSelectedFiles([]);
    setDescription("");
  };

  if (!listing) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Submit Entry</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">
                {listing.title}
              </h4>
              <p className="text-gray-400 text-sm">
                Accepted formats: {listing.format} | Max size: {listing.maxSize}
              </p>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-2">
                  Drop files here or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.json,.csv"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-white mb-2">Selected files:</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-800 rounded"
                      >
                        <span className="text-sm text-gray-300">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your submission..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
            >
              Submit Entry
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Dynamic Listing Card Component
const ListingCard = ({ listing, onSubmit }) => {
  const progressPercentage =
    (listing.submissions.current / listing.submissions.max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 p-6 bg-gray-900/50 border border-gray-700 rounded-2xl hover:border-gray-600 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Image
          src={listing.image}
          alt="Listing"
          height={64}
          width={64}
          className="w-16 h-16 object-cover rounded-full border-2 border-gray-600"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white mb-2">
            {listing.title}
          </h2>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <User className="w-4 h-4" />
            <span>Creator: {listing.creator}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 leading-relaxed">
        {listing.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-gray-400">Date:</span>
          <span className="text-white">{listing.date}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-400">Rewards:</span>
          <span className="text-green-400">{listing.rewards}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FileType className="w-4 h-4 text-purple-400" />
          <span className="text-gray-400">Format:</span>
          <span className="text-white">{listing.format}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <HardDrive className="w-4 h-4 text-orange-400" />
          <span className="text-gray-400">Max size:</span>
          <span className="text-white">{listing.maxSize}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Submissions Progress</span>
          <span className="text-sm text-white">
            {listing.submissions.current} of {listing.submissions.max}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-400/30 to-blue-500/90 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSubmit(listing)}
        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-400/30 to-blue-500/90 cursor-pointer hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/25"
      >
        Submit Entry
      </motion.button>
    </motion.div>
  );
};

const Listings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <div className="mx-4">
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
              placeholder="Search data, contributors, or categories..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-blue-400/30 to-blue-500/90 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/25"
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

        {/* Listings */}
        <div>
          {isLoading ? (
            // Show skeleton loading
            <>
              <ListingSkeleton />
              <ListingSkeleton />
            </>
          ) : (
            // Show actual listings
            sampleListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSubmit={handleSubmit}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        listing={selectedListing}
      />
    </div>
  );
};

export default Listings;
