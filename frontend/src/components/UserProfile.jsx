'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { BookmarkCheck, BookmarkIcon, BookmarkX, Loader2 } from "lucide-react";
import { RecipeCard } from './RecipeCard'; 
import axios from 'axios';


const auth = getAuth(app);
const db = getFirestore(app);


const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const RecipeBookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full min-h-[300px]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
);

//  Main Profile Component
export default function UserProfile() {
    const router = useRouter();

    // State Management 
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [bookmarks, setBookmarks] = useState([]); 
    const [token, setToken] = useState(null); 
    
    const [view, setView] = useState('main');
    const [loading, setLoading] = useState(true);
    const [bookmarksLoading, setBookmarksLoading] = useState(false); 
    const [error, setError] = useState('');

    // State for the edit form
    const [displayName, setDisplayName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    // Authentication and Data Fetching Logic 
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            if (authenticatedUser) {
                setUser(authenticatedUser);
                
                // Get the Firebase ID token for API calls
                try {
                    const idToken = await authenticatedUser.getIdToken();
                    setToken(idToken);
                } catch (err) {
                    console.error('Failed to get ID token:', err);
                }
                
                try {
                    setLoading(true);
                    setError('');

                    const profileRef = doc(db, 'users', authenticatedUser.uid);
                    const wishlistCol = collection(db, 'users', authenticatedUser.uid, 'saved_recipes');

                    const [profileSnap, wishlistSnap] = await Promise.all([
                        getDoc(profileRef),
                        getDocs(wishlistCol)
                    ]);
                    
                    if (!profileSnap.exists()) {
                        throw new Error("User profile not found in database.");
                    }

                    const profileData = profileSnap.data();
                    setProfile(profileData);
                    setDisplayName(profileData.display_name || '');
                    setPhotoUrl(profileData.photo_url || '');

                    const wishlistData = wishlistSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setWishlist(wishlistData);

                } catch (err) {
                    setError(err.message);
                    console.error("Error fetching user data:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setProfile(null);
                setWishlist([]);
                setBookmarks([]);
                setToken(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch bookmarks when view changes to bookmarks
    useEffect(() => {
        if (view === 'bookmarks' && token && !bookmarksLoading) {
            fetchBookmarks();
        }
    }, [view, token]);

    const fetchBookmarks = async () => {
        if (!token) return;
        
        setBookmarksLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/users/me/bookmarks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(response.data);
        } catch (err) {
            console.error('Failed to fetch bookmarks:', err);
            setError('Failed to load bookmarks');
        } finally {
            setBookmarksLoading(false);
        }
    };

    // Event Handlers 
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;
        setError('');
        try {
            const profileRef = doc(db, 'users', user.uid);
            await updateDoc(profileRef, { display_name: displayName, photo_url: photoUrl });
            setProfile(prevProfile => ({ ...prevProfile, display_name: displayName, photo_url: photoUrl }));
            setView('main');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveFromWishlist = async (recipeId) => {
        if (!user) return;
        try {
            const recipeRef = doc(db, 'users', user.uid, 'saved_recipes', recipeId);
            await deleteDoc(recipeRef);
            setWishlist(wishlist.filter(r => r.id !== recipeId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBookmarkChange = (recipeId) => {
        
        setBookmarks(prev => prev.filter(recipe => recipe.id !== recipeId));
    };
    
    const handleSignOut = () => {
        signOut(auth).catch(console.error);
    };

    // Render Logic 
    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Profile Page</h2>
                <p className="text-gray-600">Please sign in to view your profile and saved recipes.</p>
                <button 
                    onClick={() => router.push('/signin')} 
                    className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Sign In
                </button>
            </div>
        );
    }
    
    return (
        <div className="p-2">
            {view !== 'main' && (
                <button onClick={() => setView('main')} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
                    <ArrowLeftIcon /> Back to Profile
                </button>
            )}

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {(() => {
                switch (view) {
                    case 'edit':
                        return (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">Display Name</label>
                                        <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photoUrl">Photo URL</label>
                                        <input id="photoUrl" type="text" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Save Changes</button>
                                        <button type="button" onClick={() => setView('main')} className="text-gray-600 hover:text-gray-800 font-bold">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        );
                    
                    case 'main':
                    default:
                        return (
                            <div>
                                <div className="flex items-center mb-8">
                                    <img
                                        src={profile?.photo_url || `https://ui-avatars.com/api/?name=${profile?.display_name || user.email}&background=0D8ABC&color=fff&size=128`}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full mr-6 border-4 border-white shadow-lg"
                                    />
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">{profile?.display_name || 'User'}</h2>
                                        <p className="text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={() => setView('edit')} className="w-full flex items-center p-4 bg-gray-100 hover:bg-green-100 rounded-lg transition-colors">
                                        <UserIcon /> <span className="ml-4 font-semibold text-gray-700">Edit Profile</span>
                                    </button>
                                    <button onClick={() => router.push("/my-recipes")} className="w-full flex items-center p-4 bg-gray-100 hover:bg-green-100 rounded-lg transition-colors">
                                        <RecipeBookIcon /> <span className="ml-4 font-semibold text-gray-700">My Recipes</span>
                                    </button>
                                    <button onClick={() => router.push("/my-bookmarks")} className="w-full flex items-center p-4 bg-gray-100 hover:bg-green-100 rounded-lg transition-colors">
                                        <BookmarkIcon /> <span className="ml-4 font-semibold text-gray-700">My Bookmarks</span>
                                    </button>
                                    
                                    <button onClick={handleSignOut} className="w-full flex items-center p-4 bg-gray-100 hover:bg-red-100 rounded-lg transition-colors">
                                        <LogoutIcon /> <span className="ml-4 font-semibold text-gray-700">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        );
                }
            })()}
        </div>
    );
}
