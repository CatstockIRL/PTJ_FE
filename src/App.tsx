import React from 'react';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  // Component này chỉ cần render AppRoutes
  return (
    <AppRoutes />
  );
};

export default App;