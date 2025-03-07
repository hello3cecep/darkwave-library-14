
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
      <div className="w-full max-w-md">
        <AuthModal defaultView="signin" />
      </div>
    </div>
  );
};

export default Auth;
