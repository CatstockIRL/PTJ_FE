import React from 'react';
import { Routes, Route } from 'react-router-dom';

import EmployerPage from '../pages/EmployerPage';
import NotFoundPage from '../pages/NotFoundPage';
import JobSeekerHomePage from '../pages/JobSeekerHomePage'; 
import JobSeekerLoginPage from '../features/auth/pages/JobSeekerLoginPage';

import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLES } from '../constants/roles';

import JobPage from '../features/job/pages/JobPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes without MainLayout */}
      

      {/* Routes with MainLayout */}
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<JobSeekerHomePage />} />
        <Route path="nha-tuyen-dung" element={<EmployerPage />} />
        <Route path="jobs" element={<JobPage />} />
        <Route path="/login" element={<JobSeekerLoginPage />} />
        {/* Protected Routes for Job Seekers */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.JOB_SEEKER]} />}>
          {/* Add Job Seeker specific routes here, e.g., /ho-so */}
        </Route>

        {/* Protected Routes for Employers */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYER]} />}>
          {/* Add Employer specific routes here, e.g., /nha-tuyen-dung/dang-tin */}
        </Route>

        {/* Protected Routes for Admin */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          {/* Add Admin specific routes here, e.g., /admin/dashboard */}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};