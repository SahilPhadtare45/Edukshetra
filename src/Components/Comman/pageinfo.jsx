import React from 'react';
import { useLocation } from 'react-router-dom';
import './pageinfo.css';

const PageInfo = () => {
  const location = useLocation();

  // Map route paths to page names
  const pageNames = {
    
    '/teachers': 'Teachers',
    '/students': 'Students',
    '/dashboard': 'Class',
    '/classwork': 'Classwork',
    '/attendance': 'Attendance',
    '/people': 'People',
    '/profile': 'Profile',
    '/leave-school': 'Leave School'
      };

  // Get the current page name from the path
  let currentPage = pageNames[location.pathname] || 'Unknown Page';

   // ✅ Handle dynamic profile routes (e.g., /profile/uid)
   if (location.pathname.startsWith('/profile/')) {
    currentPage = 'Profile';
  }

  return (
    <div className="page-info">
      <div className="current-page">{currentPage}</div>
      <p className="breadcrumb">
        Home {'> '} &nbsp; <span>{ currentPage}</span>
      </p>
    </div>
  );
};

export default PageInfo;
