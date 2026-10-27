import React from 'react';
import { InterviewQuestionItem } from '../../api/interviews.js';
import { CheckCircle2 } from 'lucide-react';

interface QuestionNavigatorProps {
  questions: InterviewQuestionItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  onSelect,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {questions.map((q, idx) => {
        const isCurrent = idx === currentIndex;
        const isSolved = q.isSolved;

        return (
          <button
            key={q.id || idx}
            type="button"
            onClick={() => onSelect(idx)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isCurrent
                ? 'bg-slate-900 text-white border-slate-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isSolved ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <span
                className={`w-2 h-2 rounded-full ${
                  isCurrent ? 'bg-brand-400' : 'bg-slate-300'
                }`}
              />
            )}
            <span>Question {idx + 1}</span>
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                q.question?.difficulty === 'Easy'
                  ? 'text-emerald-600 bg-emerald-50'
                  : q.question?.difficulty === 'Medium'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-rose-600 bg-rose-50'
              }`}
            >
              {q.question?.difficulty || 'Q'}
            </span>
          </button>
        );
      })}
    </div>
  );
};
