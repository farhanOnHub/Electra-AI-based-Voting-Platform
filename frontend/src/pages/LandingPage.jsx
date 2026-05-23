import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Shield, Search, Smile, Users, ArrowRight, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export const LandingPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setEmail('');
  };

  const features = [
    {
      icon: <Smile size={32} />,
      title: t('landing.easyToUse'),
      description: t('landing.easyToUseDesc')
    },
    {
      icon: <Search size={32} />,
      title: t('landing.transparent'),
      description: t('landing.transparentDesc')
    },
    {
      icon: <Shield size={32} />,
      title: t('landing.secure'),
      description: t('landing.secureDesc')
    },
    {
      icon: <Users size={32} />,
      title: t('landing.accessible'),
      description: t('landing.accessibleDesc')
    }
  ];

  return (
    <div className="w-full overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Tagline */}
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="text-green-600" size={20} />
                <span className="text-green-600 font-semibold text-sm">{t('landing.tagline')}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                {t('landing.heroTitle')}
              </h1>

              {/* Subtext */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                {t('landing.heroSubtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link to="/register" className="px-8 py-4 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition flex items-center justify-center gap-2">
                    {t('landing.getStarted')}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </Link>
                </motion.div>
                <a href="#features" className="px-8 py-4 border-2 border-green-500 text-green-600 rounded-full font-semibold hover:bg-green-50 transition text-center">
                  {t('landing.learnMore')}
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 font-medium">{t('landing.joinOrganizations')}</p>
              </div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 flex items-center justify-center">
                {/* Ballot Box Illustration */}
                <div className="relative">
                  {/* Main box */}
                  <div className="w-64 h-80 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                    {/* Slot */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-3 bg-green-800 rounded-full"></div>
                    
                    {/* Ballot paper */}
                    <div className="w-40 h-48 bg-white rounded-lg shadow-lg transform -rotate-6 relative">
                      <div className="p-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full mb-4 flex items-center justify-center">
                          <CheckCircle2 className="text-white" size={16} />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-green-200 rounded-full opacity-50"></div>
                  <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-green-300 rounded-full opacity-50"></div>
                  <div className="absolute top-1/2 -right-12 w-12 h-12 bg-green-200 rounded-full opacity-30"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{t('landing.whyChoose')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('landing.whyChooseSubtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-green-500 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
