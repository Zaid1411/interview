import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer bg-white select-none">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10">
        <div className="footer__inner">
          <span className="footer__copyright">
            2026 © <strong>InterviewLab</strong>. All rights reserved.
          </span>
          <div className="footer__socials">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
              aria-label="GitHub"
            >
              <img src="/images/icon-github.svg" alt="GitHub" width="20" height="20" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
              aria-label="LinkedIn"
            >
              <img src="/images/icon-linkedin.svg" alt="LinkedIn" width="20" height="20" />
            </a>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
              aria-label="Portfolio"
            >
              <img src="/images/icon-dribbble.svg" alt="Portfolio" width="20" height="20" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

