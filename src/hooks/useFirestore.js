import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import * as guestService from '../services/guestService';

/**
 * useFirestore Hook
 * 
 * Provides real-time synchronization and CRUD operations.
 * Supports both authenticated users (Firestore) and guest mode (localStorage)
 */
const useFirestore = (collectionName) => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser, isGuest, guestId } = useAuth();

    // Memoize collection reference to prevent unnecessary effect triggers
    const colRef = useMemo(() => {
        if (!currentUser || isGuest) return null;
        return collection(db, 'users', currentUser.uid, collectionName);
    }, [currentUser, isGuest, collectionName]);

    // Guest mode data fetching
    useEffect(() => {
        if (isGuest) {
            setLoading(true);
            let data = [];
            
            switch(collectionName) {
                case 'tasks':
                    data = guestService.getGuestTasks();
                    break;
                case 'notes':
                    data = guestService.getGuestNotes();
                    break;
                case 'planner':
                    data = guestService.getGuestSubjects();
                    break;
                case 'aiChats':
                    data = guestService.getGuestAIChats();
                    break;
                default:
                    data = [];
            }
            
            setDocs(data);
            setLoading(false);
            return;
        }

        if (!colRef) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(colRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));

            results.sort((a, b) => {
                const timeA = a.createdAt?.seconds || Date.now() / 1000;
                const timeB = b.createdAt?.seconds || Date.now() / 1000;
                return timeB - timeA;
            });

            setDocs(results);
            setLoading(false);
        }, (error) => {
            console.error(`Firestore Error [${collectionName}]:`, error);
            setLoading(false);
        });

        return unsubscribe;
    }, [colRef, collectionName, isGuest, guestId]);

    const addItem = async (item) => {
        if (isGuest) {
            let newItem;
            switch(collectionName) {
                case 'tasks':
                    newItem = guestService.addGuestTask(item);
                    break;
                case 'notes':
                    newItem = guestService.addGuestNote(item);
                    break;
                case 'planner':
                    newItem = guestService.addGuestSubject(item);
                    break;
                case 'aiChats':
                    newItem = guestService.addGuestAIChat(item);
                    break;
            }
            setDocs(prev => [newItem, ...prev]);
            return;
        }

        if (!colRef) {
            console.error("Cannot add item: User not authenticated or collection reference missing.");
            return;
        }
        try {
            return await addDoc(colRef, {
                ...item,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error(`Error adding to ${collectionName}:`, error);
            throw error;
        }
    };

    const updateItem = async (id, updates) => {
        if (isGuest) {
            switch(collectionName) {
                case 'tasks':
                    guestService.updateGuestTask(id, updates);
                    break;
                case 'notes':
                    guestService.updateGuestNote(id, updates);
                    break;
            }
            setDocs(prev => prev.map(item => item.id === id ? {...item, ...updates} : item));
            return;
        }

        if (!colRef || !currentUser) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid, collectionName, id);
            return await updateDoc(docRef, updates);
        } catch (error) {
            console.error(`Error updating ${collectionName}:`, error);
            throw error;
        }
    };

    const deleteItem = async (id) => {
        if (isGuest) {
            switch(collectionName) {
                case 'tasks':
                    guestService.deleteGuestTask(id);
                    break;
                case 'notes':
                    guestService.deleteGuestNote(id);
                    break;
                case 'planner':
                    guestService.deleteGuestSubject(id);
                    break;
            }
            setDocs(prev => prev.filter(item => item.id !== id));
            return;
        }

        if (!colRef || !currentUser) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid, collectionName, id);
            return await deleteDoc(docRef);
        } catch (error) {
            console.error(`Error deleting from ${collectionName}:`, error);
            throw error;
        }
    };

    return { docs, loading, addItem, updateItem, deleteItem };
};

export default useFirestore;

