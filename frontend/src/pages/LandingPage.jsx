import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Zap, BarChart3, Lock, Wifi, MessageSquare, 
  ChevronDown, ExternalLink, CheckCircle2, Star, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export const LandingPage = () => {
  const [email, setEmail] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setEmail('');
  };

  const features = [
    {
      icon: <Shield size={28} />,
      title: 'Secure Voting',
      description: 'End-to-end encrypted voting system with JWT authentication'
    },
    {
      icon: <Zap size={28} />,
      title: 'Real-Time Updates',
      description: 'Live vote counting and instant result updates via Socket.IO'
    },
    {
      icon: <Users size={28} />,
      title: 'Easy Access',
      description: 'Join events with unique codes and vote in seconds'
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Analytics',
      description: 'Comprehensive voting analytics and participation reports'
    },
    {
      icon: <Lock size={28} />,
      title: 'Anti-Fraud',
      description: 'One vote per user with blockchain-ready architecture'
    },
    {
      icon: <Wifi size={28} />,
      title: 'Always Online',
      description: 'Cloud-based infrastructure with 99.9% uptime'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '1000+', label: 'Events Hosted' },
    { number: '500K+', label: 'Votes Cast' },
    { number: '99.9%', label: 'Uptime' }
  ];

  const testimonials = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'College Principal',
      image: '👨‍💼',
      text: 'Electra revolutionized our student elections. Transparent, secure, and highly efficient!'
    },
    {
      name: 'Priya Sharma',
      role: 'Event Manager',
      image: '👩‍💼',
      text: 'The platform is so intuitive. Our participants loved the real-time results feature.'
    },
    {
      name: 'Arjun Patel',
      role: 'Tech Lead',
      image: '👨‍💻',
      text: 'Best voting platform for tech communities. Great API documentation and support!'
    }
  ];

  const faqItems = [
    {
      question: 'How secure is Electra?',
      answer: 'Electra uses JWT authentication, bcrypt password hashing, and MongoDB sanitization to ensure maximum security. All data is encrypted in transit and at rest.'
    },
    {
      question: 'Can I create multiple events?',
      answer: 'Yes! Admin users can create unlimited events, add candidates, set voting periods, and manage everything from the dashboard.'
    },
    {
      question: 'How do participants join events?',
      answer: 'Participants can join events using unique event codes or QR codes. They just need to register and enter the code to start voting.'
    },
    {
      question: 'What payment options are available?',
      answer: 'Electra offers flexible pricing plans. Basic events are free, with premium features available at competitive rates.'
    },
    {
      question: 'Can I export results?',
      answer: 'Yes! Results can be exported as PDF or CSV with detailed analytics and participant information.'
    },
    {
      question: 'Is there technical support?',
      answer: 'We provide 24/7 email support and detailed documentation. Premium users get priority support and dedicated assistance.'
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(0);

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
            animate={{ y: [50, 0, 50] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-blue-600 bg-clip-text text-transparent">
                Secure Online Voting
              </span>
              <br />
              Made Simple
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
              The modern platform for fair, transparent, and secure voting. Perfect for colleges, organizations, events, and communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8">
                Get Started Free
                <ArrowRight className="inline ml-2" size={20} />
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8">
                Learn More
              </a>
            </div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mt-16"
            >
              <ChevronDown className="mx-auto text-primary-400" size={32} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-primary-400 mb-2">{stat.number}</p>
                <p className="text-dark-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-dark-800/30 to-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-dark-300">Everything you need for secure and efficient voting</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                className="card hover:shadow-xl hover:shadow-primary-500/20"
              >
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-dark-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-dark-300">Simple steps to secure voting</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Create Account', desc: 'Sign up in seconds' },
              { num: '2', title: 'Join Event', desc: 'Use event code' },
              { num: '3', title: 'Cast Vote', desc: 'Select candidate' },
              { num: '4', title: 'See Results', desc: 'Real-time updates' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-dark-300">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-dark-900 to-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Users</h2>
            <p className="text-xl text-dark-300">See what our community has to say</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                className="card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-dark-300 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{testimonial.image}</div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-dark-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-dark-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-dark-300">Find answers to common questions</p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                className="card"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                  className="w-full flex justify-between items-center"
                >
                  <h3 className="font-semibold text-lg text-left">{item.question}</h3>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <p className="text-dark-300 mt-4 pt-4 border-t border-white/10">{item.answer}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-gradient-to-b from-dark-900 to-dark-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-dark-300">We'd love to hear from you</p>
          </motion.div>

          <form onSubmit={handleContactSubmit} className="glass p-8">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 input-field"
              />
              <button type="submit" className="btn-primary px-8">
                Send
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600/20 to-blue-600/20 border-t border-primary-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-dark-300 mb-8">Join thousands of organizations using Electra for secure voting</p>
          <Link to="/register" className="btn-primary text-lg px-8 inline-block">
            Create Your First Event Today
            <ExternalLink className="inline ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};
