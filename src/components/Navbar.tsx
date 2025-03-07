
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import AuthModal from '@/components/AuthModal';

const Navbar = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <>
      <nav className="bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold mr-8">MusiStream</Link>
            
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-sm font-medium">Home</Link>
              <Link to="/browse" className="text-sm font-medium">Browse</Link>
              {user && (
                <Link to="/library" className="text-sm font-medium">Library</Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8"
              />
            </div>
            
            {user && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/upload">Upload</Link>
              </Button>
            )}
            
            <UserMenu onOpenAuthModal={openAuthModal} />
          </div>
        </div>
      </nav>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default Navbar;
