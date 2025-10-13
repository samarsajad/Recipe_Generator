'use client';

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserCircle, Search, Loader2, Upload, Home } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import UserProfile from "@/components/UserProfile";
import { LoginDialog } from "@/components/LoginDialog";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onScan?: () => void;
  isUploading?: boolean;
}

export default function Header({ onSearch, onScan, isUploading }: HeaderProps) {
  const [mainSearch, setMainSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch && mainSearch.trim()) onSearch(mainSearch.trim());
  };

  const handleSignOut = () => {
    signOut(auth);
    setIsProfileOpen(false);
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background gap-4">
      
      {/* Left: Home button */}
      <Link href="/">
  <Button
    variant="outline"
    size="icon"
    className="rounded-full p-2 bg-gray-100 hover:bg-green-100 transition-colors duration-300"
  >
    <Home size={20} className="text-gray-700 hover:text-green-600 transition-colors duration-300" />
  </Button>
</Link>

{/* Profile Dialog */}
<Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      size="icon"
      className="rounded-full p-2 bg-gray-100 hover:bg-green-100 transition-colors duration-300"
    >
      {user && user.photoURL ? (
        <img
          src={user.photoURL}
          alt="User"
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : (
        <UserCircle
          size={20}
          className="text-gray-700 hover:text-green-600 transition-colors duration-300"
        />
      )}
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{user ? "Your Profile" : "Sign In"}</DialogTitle>
    </DialogHeader>
    {user ? <UserProfile /> : <LoginDialog setOpen={setIsProfileOpen} />}
  </DialogContent>
</Dialog>

      {/* Center: Search & Scan */}
      <div className="flex flex-grow justify-center gap-4 px-2 sm:px-4">
        {onSearch && (
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search recipes by name..."
              className="pl-10"
              value={mainSearch}
              onChange={e => setMainSearch(e.target.value)}
            />
          </form>
        )}
        {onScan && (
          <>
            <Button variant="outline" className="w-full max-w-md" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? 'Scanning...' : 'Scan Ingredients'}
            </Button>
            <Input type="file" ref={fileInputRef} onChange={() => onScan?.()} className="hidden" accept="image/jpeg, image/png" />
          </>
        )}
      </div>
    </header>
  );
}
