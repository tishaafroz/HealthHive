import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaRunning, FaBullseye, FaLeaf, FaCheckCircle } from 'react-icons/fa';
import '../styles/ProfileSetup.css';

const pastelColors = [
  '#a5b4fc', // pastel blue
  '#fbc2eb', // pastel pink
  '#d1fae5', // pastel green
  '#fef9c3', // pastel yellow
  '#fcd34d'  // pastel orange
];

const icons = [
  <FaUser key="user" />,
  <FaRunning key="run" />,
  <FaBullseye key="goal" />,
  <FaLeaf key="leaf" />,
  <FaCheckCircle key="check" />
];

const ProfileProgress = ({ step, totalSteps }) => {
  const percent = ((step + 1) / totalSteps) * 100;

  return (
    <div className="animated-progress-bar">
      <motion.div
        className="progress-bar-outer"
        initial={{ background: '#23272f' }}
        animate={{ background: '#fff', transition: { duration: 0.5 } }}
      >
        <motion.div
          className="progress-bar-inner"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, type: 'spring' }}
          style={{
            background: `linear-gradient(90deg, ${pastelColors[step % pastelColors.length]}, ${pastelColors[(step + 1) % pastelColors.length]})`
          }}
        />
        <div className="progress-bar-steps">
          {[...Array(totalSteps)].map((_, idx) => (
            <motion.div
              key={idx}
              className={`progress-step${idx <= step ? ' active' : ''}`}
              style={{
                background: idx <= step
                  ? pastelColors[idx % pastelColors.length]
                  : '#e0e7ef',
                color: idx <= step ? '#23272f' : '#a1a1aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}
              animate={idx === step ? { scale: 1.2 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {icons[idx]}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileProgress; 