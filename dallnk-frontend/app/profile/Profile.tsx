"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ExternalLink,
  BarChart3,
  Flame,
  Gift,
  TrendingUp,
  Users,
  Clock,
  Star,
  Eye,
  Heart,
  MessageCircle,
  Share,
} from "lucide-react";

// Mock avatar component since we don't have avvvatars-react
const MockAvatar = ({ value, size }: { value: string; size: number }) => {
  const colors = ["#6366f1", "#ec4899", "#eab308", "#10b981", "#f97316"];
  const color = colors[value.length % colors.length];

  return (
    <div
      className="rounded-2xl flex items-center justify-center text-white font-bold text-4xl"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      }}
    >
      {value.slice(2, 4).toUpperCase()}
    </div>
  );
};

interface ProfileBannerProps {
  walletAddress: string;
  username: string;
  reputationScore?: number;
}

const ProfileBanner = ({
  walletAddress,
  username,
  reputationScore,
}: ProfileBannerProps) => {
  const getBadgeColor = () => {
    if (!reputationScore) return "border-[#6366f1]";
    if (reputationScore >= 5000) return "border-[#ec4899]";
    if (reputationScore >= 1000) return "border-[#eab308]";
    if (reputationScore >= 500) return "border-[#94a3b8]";
    return "border-[#b45309]";
  };

  const getBadgeIcon = () => {
    if (!reputationScore)
      return <ShieldCheck className="w-5 h-5 text-[#6366f1]" />;
    if (reputationScore >= 5000)
      return <ShieldCheck className="w-5 h-5 text-[#ec4899]" />;
    if (reputationScore >= 1000)
      return <ShieldCheck className="w-5 h-5 text-[#eab308]" />;
    if (reputationScore >= 500)
      return <ShieldCheck className="w-5 h-5 text-[#94a3b8]" />;
    return <ShieldCheck className="w-5 h-5 text-[#b45309]" />;
  };

  return (
    <div className="h-48 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f17] relative mb-24 border border-white/10 rounded-2xl">
      <div className="absolute -bottom-16 left-8 flex items-end gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl bg-[#0f0f17] p-1 border-2 border-white/20">
            <MockAvatar value={walletAddress} size={120} />
          </div>
          <div
            className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#0f0f17] flex items-center justify-center border-2 ${getBadgeColor()}`}
          >
            {getBadgeIcon()}
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{username}</h1>
            {reputationScore && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-sm text-white">
                <BarChart3 className="w-4 h-4 text-[#6366f1]" />
                <span>{reputationScore} Rep</span>
              </div>
            )}
          </div>
          <button
            onClick={() =>
              window.open(
                `https://explorer.aptoslabs.com/account/${walletAddress}?network=bardock+testnet`,
                "_blank"
              )
            }
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm w-fit text-gray-300 hover:text-white"
          >
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: number | null;
}

const StatCard = ({ icon, title, value, change }: StatCardProps) => (
  <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      {change && (
        <div
          className={`flex items-center gap-1 text-sm ${
            change > 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {change > 0 ? "+" : ""}
          {change}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{title}</div>
  </div>
);

interface ActivityItemProps {
  type: string;
  title: string;
  timestamp: string;
  status: string;
}

const ActivityItem = ({
  type,
  title,
  timestamp,
  status,
}: ActivityItemProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "submission":
        return <BarChart3 className="w-5 h-5 text-[#6366f1]" />;
      case "bounty":
        return <Gift className="w-5 h-5 text-[#ec4899]" />;
      case "reward":
        return <Flame className="w-5 h-5 text-[#eab308]" />;
      default:
        return <TrendingUp className="w-5 h-5 text-[#10b981]" />;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-[#1a1a2e] border border-white/10 rounded-lg hover:border-white/20 transition-all">
      <div className="p-2 bg-white/5 rounded-lg">{getTypeIcon()}</div>
      <div className="flex-1">
        <div className="text-white font-medium">{title}</div>
        <div className="text-gray-400 text-sm flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {timestamp}
        </div>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs border ${getStatusColor()}`}
      >
        {status}
      </div>
    </div>
  );
};

interface BountyCardProps {
  title: string;
  description: string;
  reward: string | number;
  submissions: string | number;
  deadline: string;
  status: string;
}

const BountyCard = ({
  title,
  description,
  reward,
  submissions,
  deadline,
  status,
}: BountyCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "closed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-3">{description}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs border ${getStatusColor()}`}
        >
          {status}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-[#6366f1]">
            <span className="font-medium">{reward} FIL</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <BarChart3 className="w-4 h-4" />
            <span>{submissions} submissions</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Deadline: {deadline}</span>
        </div>
        <button className="text-[#6366f1] hover:text-[#5855eb] transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

interface ContentCardProps {
  title: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  time: string;
}

const ContentCard = ({
  title,
  image,
  views,
  likes,
  comments,
  time,
}: ContentCardProps) => (
  <div className="bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
    <div className="aspect-video bg-gradient-to-br from-[#6366f1] to-[#ec4899] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-white font-bold text-lg">{title}</div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/50 rounded text-white text-xs">
        <Eye className="w-3 h-3" />
        {views}
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {likes}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {comments}
          </div>
          <div className="flex items-center gap-1">
            <Share className="w-4 h-4" />
            Share
          </div>
        </div>
        <div>{time}</div>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const mockUser = {
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    username: "CryptoTrader_007",
    reputationScore: 2750,
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "activity", label: "Activity" },
    { id: "bounty", label: "Bounty" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f17] text-white">
      <div className="max-w-6xl mx-auto p-6">
        <ProfileBanner {...mockUser} />

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 bg-[#1a1a2e] p-1 rounded-xl border border-white/10 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[#6366f1] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                icon={<BarChart3 className="w-6 h-6 text-[#6366f1]" />}
                title="Total Submissions"
                value="247"
                change={12}
              />
              <StatCard
                icon={<Gift className="w-6 h-6 text-[#ec4899]" />}
                title="Bounties Created"
                value="18"
                change={5}
              />
            </div>

            {/* Recent Activity Preview */}
            <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Recent Submissions</h3>
              <div className="space-y-3">
                <ActivityItem
                  type="submission"
                  title="Submitted dataset for ML Training Bounty"
                  timestamp="2 hours ago"
                  status="pending"
                />
                <ActivityItem
                  type="submission"
                  title="Dataset approved for Climate Data Collection"
                  timestamp="5 hours ago"
                  status="success"
                />
                <ActivityItem
                  type="submission"
                  title="Submitted financial dataset for analysis"
                  timestamp="1 day ago"
                  status="success"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Submission History</h3>
            <ActivityItem
              type="submission"
              title="Submitted healthcare dataset - 50k records"
              timestamp="30 minutes ago"
              status="pending"
            />
            <ActivityItem
              type="submission"
              title="Dataset approved: Financial Market Data 2024"
              timestamp="2 hours ago"
              status="success"
            />
            <ActivityItem
              type="reward"
              title="Earned 25 FIL for IoT sensor data"
              timestamp="3 hours ago"
              status="success"
            />
            <ActivityItem
              type="submission"
              title="Submitted climate research dataset"
              timestamp="5 hours ago"
              status="success"
            />
            <ActivityItem
              type="submission"
              title="Dataset rejected - quality standards not met"
              timestamp="8 hours ago"
              status="failed"
            />
            <ActivityItem
              type="reward"
              title="Received 15 FIL for agricultural data"
              timestamp="1 day ago"
              status="success"
            />
          </div>
        )}

        {activeTab === "bounty" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Created Bounties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BountyCard
                title="ML Training Dataset - E-commerce"
                description="Need comprehensive e-commerce transaction data for machine learning model training. Must include customer behavior patterns and purchase history."
                reward="150"
                submissions="23"
                deadline="Dec 15, 2024"
                status="active"
              />
              <BountyCard
                title="Climate Research Data Collection"
                description="Looking for weather station data from rural areas. Temperature, humidity, precipitation data from 2020-2024 preferred."
                reward="200"
                submissions="41"
                deadline="Nov 30, 2024"
                status="active"
              />
              <BountyCard
                title="Financial Market Analysis Dataset"
                description="Stock price data with technical indicators for cryptocurrency markets. Need hourly data for past 2 years."
                reward="300"
                submissions="67"
                deadline="Oct 20, 2024"
                status="completed"
              />
              <BountyCard
                title="IoT Sensor Network Data"
                description="Smart city sensor data including traffic, air quality, noise levels. Real-time or near real-time preferred."
                reward="180"
                submissions="12"
                deadline="Jan 10, 2025"
                status="active"
              />
              <BountyCard
                title="Healthcare Analytics Dataset"
                description="Anonymized patient data for medical research. Must comply with privacy regulations and include treatment outcomes."
                reward="400"
                submissions="89"
                deadline="Sep 15, 2024"
                status="closed"
              />
              <BountyCard
                title="Social Media Sentiment Data"
                description="Public social media posts with sentiment labels for NLP model training. Multiple languages preferred."
                reward="120"
                submissions="156"
                deadline="Nov 05, 2024"
                status="active"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
