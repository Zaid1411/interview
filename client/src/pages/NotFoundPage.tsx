import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Button>
        </Link>
        <Link to="/questions">
          <Button variant="outline">Browse Questions</Button>
        </Link>
      </div>
    </div>
  );
};
