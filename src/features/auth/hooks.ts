// Custom hooks for auth feature
import { useState } from "react";
import type { User } from "./types";
import { ROLES } from "../../constants/roles";

// Mock user data. In a real application, you would get this from your auth context or state management.
const mockUser: User = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  role: ROLES.JOB_SEEKER, // Change this to ROLES.EMPLOYER or ROLES.ADMIN to test different roles
};

export const useAuth = () => {
  const [user] = useState<User | null>();

  return {
    user,
    isAuthenticated: !!user,
  };
};
