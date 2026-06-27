import { useState } from 'react';

export const useTest = (questions = []) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});

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

