import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Navigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar.jsx';
import TestList from '../components/student/TestList.jsx';
import TestEngine from '../components/student/TestEngine.jsx';
import ResultScreen from '../components/student/ResultScreen.jsx';
import { motion } from 'framer-motion';

const StudentPortal = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [selectedTest, setSelectedTest] = useState(null);
  const [activeResultId, setActiveResultId] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal space-y-4">
        <div className="h-12 w-12 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-softgrey">Securing connection tunnel...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  const handleStartTest = (testObj) => {
    setSelectedTest(testObj);
    setActiveScreen('test');
  };

  const handleViewResult = (resultId) => {
    setActiveResultId(resultId);
    setActiveScreen('result');
  };

  const handleFinishTest = (newResultId) => {
    setSelectedTest(null);
    if (newResultId) {
      setActiveResultId(newResultId);
      setActiveScreen('result');
    } else {
      setActiveScreen('dashboard');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-charcoal flex flex-col"
    >
      {activeScreen !== 'test' && <Navbar />}

      <div className="flex-1 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {activeScreen === 'dashboard' && (
          <TestList
            onStartTest={handleStartTest}
            onViewResult={handleViewResult}
          />
        )}

        {activeScreen === 'test' && selectedTest && (
          <TestEngine
            test={selectedTest}
            onFinish={handleFinishTest}
          />
        )}

        {activeScreen === 'result' && activeResultId && (
          <ResultScreen
            resultId={activeResultId}
            onBack={() => {
              setActiveResultId('');
              setActiveScreen('dashboard');
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default StudentPortal;
