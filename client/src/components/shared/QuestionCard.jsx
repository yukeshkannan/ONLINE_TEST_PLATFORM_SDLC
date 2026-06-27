import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const QuestionCard = ({ question, selectedOption, onSelectOption, questionNumber, totalQuestions }) => {
  if (!question) return null;

  return (
    <div className="bg-charcoal-surface border border-accent/15 rounded-xl p-6 shadow-xl shadow-black/40">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-accent/10 pb-4 mb-6">
        <span className="text-xs font-bold text-accent tracking-wider uppercase">
          Question {questionNumber} of {totalQuestions || question.total || questionNumber}
        </span>
        <span className="text-[10px] bg-primary/20 text-success border border-primary/40 px-2.5 py-0.5 rounded-full font-bold">
          {question.marks || 1} Mark{question.marks > 1 ? 's' : ''}
        </span>
      </div>

      {/* Question Text */}
      <div className="text-base md:text-lg font-medium text-slate-800 mb-8 leading-relaxed">
        {question.questionText}
      </div>

      {/* MCQ Options */}
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => onSelectOption(opt.label)}
              className={`flex items-center justify-between text-left p-4 rounded-lg transition-all duration-300 border ${
                isSelected
                  ? 'bg-primary/20 border-accent text-white shadow-lg shadow-accent/5'
                  : 'bg-charcoal-light border-accent/10 text-softgrey hover:bg-slate-50 hover:text-slate-800 hover:border-accent/30'
              }`}
            >
              <div className="flex items-center space-x-4 pr-4">
                <span className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                  isSelected 
                    ? 'bg-accent text-charcoal' 
                    : 'bg-charcoal-surface text-softgrey border border-accent/10'
                }`}>
                  {opt.label}
                </span>
                <span className="text-sm font-medium leading-normal">{opt.text}</span>
              </div>
              
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
