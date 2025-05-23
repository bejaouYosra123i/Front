import { useContext } from 'react';
import { AuthContext } from '../auth/auth.context';

export default function usePrivileges() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('usePrivileges must be used within AuthContextProvider');
  return ctx.privileges || [];
} 