import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Comic } from '../types';
import { MOCK_COMICS } from '../data';

interface ComicsContextType {
  comics: Comic[];
  loading: boolean;
}

const ComicsContext = createContext<ComicsContextType | undefined>(undefined);

export const ComicsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const comicsCol = collection(db, 'comics');
    const unsubscribe = onSnapshot(comicsCol, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No comics in database, seeding from mock data...");
        try {
          for (const comic of MOCK_COMICS) {
            await setDoc(doc(db, 'comics', comic.id), comic);
          }
        } catch (error) {
          console.error("Seeding failed: ", error);
        }
      } else {
        const list: Comic[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Comic);
        });
        list.sort((a, b) => a.id.localeCompare(b.id));
        setComics(list);
        setLoading(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'comics');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <ComicsContext.Provider value={{ comics, loading }}>
      {children}
    </ComicsContext.Provider>
  );
};

export const useComics = () => {
  const context = useContext(ComicsContext);
  if (context === undefined) {
    throw new Error('useComics must be used within a ComicsProvider');
  }
  return context;
};
