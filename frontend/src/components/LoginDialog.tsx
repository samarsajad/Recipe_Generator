'use client';

import { useState, FormEvent } from 'react';
import { 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
// NEW: Import Firestore functions
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, app } from '@/lib/firebase'; // Make sure to export 'app' from firebase.ts
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// NEW: Initialize Firestore
const db = getFirestore(app);

interface LoginDialogProps {
  setOpen: (open: boolean) => void;
}

export function LoginDialog({ setOpen }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthSuccess = () => setOpen(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // NEW: Check if user exists in Firestore, if not, create them
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // This is a new user, create their profile document
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          display_name: user.displayName || user.email?.split('@')[0],
          photo_url: user.photoURL || '',
        });
        console.log("New Google user profile created in Firestore!");
      }

      handleAuthSuccess();
} catch (error) { 
  let errorMessage = "An unexpected error occurred."; 
  
  
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  setError(errorMessage);
}
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        
       
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          display_name: email.split('@')[0], 
          photo_url: '', 
        });
        console.log("New email user profile created in Firestore!");
        
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleAuthSuccess();
} catch (error) { 
  let errorMessage = "An unexpected error occurred.";
  
  if (error && typeof error === 'object' && 'code' in error) {
   
    const errorCode = (error as { code: unknown }).code; 
    if (typeof errorCode === 'string') {
      errorMessage = errorCode.replace('auth/', '').replace(/-/g, ' ');
    }
  } 
  else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  setError(errorMessage);
}

  };

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">
        {isSignUp ? 'Create an Account' : 'Sign In'}
      </h2>

      {error && (
        <p className="text-red-500 text-sm p-2 bg-red-100 rounded-md">
          {error}
        </p>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button variant="outline" onClick={handleGoogleSignIn} className="w-full">
        Sign in with Google
      </Button>

      <p className="text-center text-sm">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="underline ml-1 font-semibold"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}