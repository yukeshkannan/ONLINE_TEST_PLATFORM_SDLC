import { useState, useEffect } from 'react';

export const useTest = (questions = [], testId = null) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Initialize answers from localStorage if present
  const [answers, setAnswers] = useState(() => {
    if (testId) {
      const saved = localStorage.getItem(`assessment_answers_${testId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved answers', e);
        }
      }
    }
    return {};
  });

  // Initialize flagged status from localStorage if present
  const [flagged, setFlagged] = useState(() => {
    if (testId) {
      const saved = localStorage.getItem(`assessment_flagged_${testId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing flagged questions', e);
        }
      }
    }
    return {};
  });

  // Sync answers to localStorage
  useEffect(() => {
    if (testId) {
      localStorage.setItem(`assessment_answers_${testId}`, JSON.stringify(answers));
    }
  }, [answers, testId]);

  // Sync flagged status to localStorage
  useEffect(() => {
    if (testId) {
      localStorage.setItem(`assessment_flagged_${testId}`, JSON.stringify(flagged));
    }
  }, [flagged, testId]);

  const selectOption = (questionId, optionLabel) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel
    }));
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const navigateTo = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIdx(index);
    }
  };

  const clearAnswer = (questionId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const getSubmissionPayload = () => {
    return questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] || ''
    }));
  };

  return {
    currentIdx,
    answers,
    flagged,
    selectOption,
    toggleFlag,
    nextQuestion,
    prevQuestion,
    navigateTo,
    clearAnswer,
    getSubmissionPayload
  };
};

export default useTest;

