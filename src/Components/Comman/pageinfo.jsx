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
      };

  // Get the current page name from the path
  const currentPage = pageNames[location.pathname] || 'Unknown Page';

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
