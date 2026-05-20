import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      className={`
        backdrop-blur-lg bg-white/10 border border-white/20
        rounded-2xl shadow-xl
        ${hover ? 'hover:bg-white/15 hover:border-white/30' : ''}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export const GradientCard = ({ children, className = '', gradient = 'from-blue-500 to-purple-600' }) => {
  return (
    <motion.div
      className={`
        bg-gradient-to-br ${gradient}
        rounded-2xl shadow-xl
        ${className}
      `}
      whileHover={{ scale: 1.02, rotate: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};
