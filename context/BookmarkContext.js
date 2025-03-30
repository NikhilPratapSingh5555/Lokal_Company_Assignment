// context/BookmarkContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const loadBookmarks = async () => {
      const saved = await AsyncStorage.getItem('bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    };
    loadBookmarks();
  }, []);

  const addBookmark = async (job) => {
    const updated = [...bookmarks, job];
    setBookmarks(updated);
    await AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  const removeBookmark = async (id) => {
    const updated = bookmarks.filter(job => job.id !== id);
    setBookmarks(updated);
    await AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => useContext(BookmarkContext);
