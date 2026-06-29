import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/shared/Navbar.jsx';
import TestList from '../components/student/TestList.jsx';
import TestEngine from '../components/student/TestEngine.jsx';
import ResultScreen from '../components/student/ResultScreen.jsx';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const StudentPortal = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialView = searchParams.get('view') || 'dashboard';
  const initialResultId = searchParams.get('resultId') || '';
  const initialTestId = searchParams.get('testId') || '';

  const [activeScreen, setActiveScreen] = useState(initialView);
  const [selectedTest, setSelectedTest] = useState(null);
  const [activeResultId, setActiveResultId] = useState(initialResultId);
  const [loadingInitialData, setLoadingInitialData] = useState(false);

  useEffect(() => {
    const view = searchParams.get('view') || 'dashboard';
    const resId = searchParams.get('resultId') || '';
    const tId = searchParams.get('testId') || '';

    setActiveScreen(view);
    if (resId) setActiveResultId(resId);

    if (view === 'test' && tId && !selectedTest) {
      setLoadingInitialData(true);
      api.get(`/tests/${tId}`)
        .then(({ data }) => {
          setSelectedTest(data);
        })
        .catch(() => {
          toast.error('Failed to restore assessment session.');
          setSearchParams({});
          setActiveScreen('dashboard');
        })
        .finally(() => setLoadingInitialData(false));
    }
  }, [searchParams]);

  if (loading || loadingInitialData) {
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
    setSearchParams({ view: 'test', testId: testObj._id });
  };

  const handleViewResult = (resultId) => {
    setActiveResultId(resultId);
    setActiveScreen('result');
    setSearchParams({ view: 'result', resultId });
  };

  const handleFinishTest = (newResultId) => {
    setSelectedTest(null);
    if (newResultId) {
      setActiveResultId(newResultId);
      setActiveScreen('result');
      setSearchParams({ view: 'result', resultId: newResultId });
    } else {
      setActiveScreen('dashboard');
      setSearchParams({});
    }
  };

  const handleBackToDashboard = () => {
    setActiveResultId('');
    setSelectedTest(null);
    setActiveScreen('dashboard');
    setSearchParams({});
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
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </motion.div>
  );
};

export default StudentPortal;
