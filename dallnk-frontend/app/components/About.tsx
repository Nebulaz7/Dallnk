"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Database,
  Users,
  Coins,
  Shield,
  ArrowRight,
  Zap,
  Globe,
  Award,
  ArrowUpRight,
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Decentralized Data",
      description:
        "Secure, verified data from a global community of contributors stored on the filecoin network",
      color: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description:
        "Join thousands of data miners working together to improve AI",
      color: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Earn Rewards",
      description:
        "Get incentivized for contributing valuable data to train AI models",
      color: "bg-green-500/10 border-green-500/20",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified & Graded",
      description:
        "All data is verified and graded using our powerfull AI model",
      color: "bg-orange-500/10 border-orange-500/20",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Contributors" },
    { number: "1M+", label: "Data Points Verified" },
    { number: "500+", label: "AI Models Trained" },
    { number: "99.9%", label: "Data Accuracy" },
  ];

  const steps = [
    {
      step: "01",
      title: "Join the Community",
      description:
        "Sign up and become part of our global data mining community",
      icon: <Users className="w-6 h-6" />,
    },
    {
      step: "02",
      title: "Share Your Data",
      description:
        "Contribute valuable data that can be used to train AI models",
      icon: <Database className="w-6 h-6" />,
    },
    {
      step: "03",
      title: "Get Verified",
      description:
        "Our AI model verifies your data for quality and authenticity",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      step: "04",
      title: "Earn Rewards",
      description:
        "Receive incentives in FIL tokens for your valuable contributions to AI development",
      icon: <Coins className="w-6 h-6" />,
    },
  ];

  return (
    <section className="relative min-h-screen bg-black/95 py-20 px-6 lg:px-20 overflow-hidden z-0">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">
              About{" "}
              <span style={{ fontFamily: "orbitron, sans-serif" }}>Dallnk</span>{" "}
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-light mb-6 hero-font">
            Revolutionizing{" "}
            <span className="relative">
              <span className="highlight-text font-bold">AI Data</span>
            </span>{" "}
            Collection
          </h2>

          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            <span
              style={{ fontFamily: "orbitron, sans-serif" }}
              className="text-white"
            >
              Dallnk
            </span>{" "}
            is a decentralized platform that connects data contributors with AI
            developers, creating a sustainable ecosystem where everyone benefits
            from the advancement of artificial intelligence.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-3xl lg:text-4xl font-bold text-white mb-2"
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`p-6 rounded-2xl border backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300 ${feature.color}`}
            >
              <div className="text-white mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                How It Works
              </span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-light text-white mb-4">
              Simple Steps to{" "}
              <span className="highlight-text font-bold">Get Started</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-blue-400">{step.icon}</div>
                      <h4 className="text-lg font-semibold text-white">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 -right-4 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center bg-gradient-to-r from-blue-700/20 to-blue-900/20 rounded-3xl p-12 border border-blue-500/10"
        >
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h3 className="text-3xl lg:text-4xl font-light text-white mb-4">
            Ready to Join the{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold">
              Future
            </span>{" "}
            of AI?
          </h3>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Start contributing to the next generation of AI models while earning
            rewards for your valuable data contributions.
          </p>
          <motion.button
            className="bg-blue-500 text-[14px] text-white md:text-[24px] px-5 py-3 md:px-6 cursor-pointer md:py-3 rounded-full items-center hover:bg-[#101010] shadow-sm shadow-blue-400/50  hover:shadow-md hover:shadow-blue-400/50 transition duration-100"
            whileHover="hover"
            variants={{
              hover: { scale: 1.0, y: -2 },
            }}
            layout
          >
            Get Started
            <motion.span
              className="text-lg font-extralight"
              variants={{
                hover: {
                  x: 4,
                  transition: { stiffness: 400, damping: 10 },
                },
              }}
            >
              <ArrowUpRight className="inline-block mb-1 ml-1 w-3 h-3 md:w-6 md:h-6 " />
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
