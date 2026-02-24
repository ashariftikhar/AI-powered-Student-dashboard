import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as guestService from '../services/guestService';

/**
 * useFirestore Hook
 * 
 * Uses localStorage for all operations (no Firebase)
 */
const useFirestore = (collectionName) => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;
        
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
    }, [collectionName, currentUser]);

    const addItem = async (item) => {
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
    };

    const updateItem = async (id, updates) => {
        switch(collectionName) {
            case 'tasks':
                guestService.updateGuestTask(id, updates);
                break;
            case 'notes':
                guestService.updateGuestNote(id, updates);
                break;
        }
        setDocs(prev => prev.map(item => item.id === id ? {...item, ...updates} : item));
    };

    const deleteItem = async (id) => {
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
    };

    return { docs, loading, addItem, updateItem, deleteItem };
};

export default useFirestore;

