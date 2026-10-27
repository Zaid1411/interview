import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { EditorialSidebar } from './EditorialSidebar.js';
import { Footer } from './Footer.js';

export const AppShell: React.FC = () => {
  const location = useLocation();

  // Full-screen focused mode for coding editor or timed mock room
  const isDedicatedWorkspace =
    location.pathname.startsWith('/interview/room') ||
    location.pathname.startsWith('/questions/');

  return (
    <div
      className={`min-h-screen ${
        isDedicatedWorkspace ? 'bg-[#07080b]' : 'bg-white'
      } text-[#181212] flex flex-col relative selection:bg-[#2D80FD]/20 selection:text-[#181212]`}
    >
      {/* If not in dedicated workspace, render the persistent editorial left sidebar */}
      {!isDedicatedWorkspace && <EditorialSidebar />}

      {/* Main Content Pane */}
      <main
        className={`flex-1 flex flex-col w-full transition-all duration-200 ${
          !isDedicatedWorkspace ? 'lg:pl-60' : 'h-screen overflow-hidden'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
        {!isDedicatedWorkspace && <Footer />}
      </main>
    </div>
  );
};
