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
      const docs = snapshot.docs.map(docSnap => docSnap.data() as Comic);
      const configDoc = docs.find(d => d.id === '_config');
      const actualComics = docs.filter(d => d.id && !d.id.startsWith('_'));

      if (!configDoc && actualComics.length === 0) {
        console.log("No comics in database and config not found, seeding from mock data...");
        try {
          // Set the config document first to prevent race conditions or re-seeding
          await setDoc(doc(db, 'comics', '_config'), { id: '_config', title: 'Config', author: 'System' } as any);
          for (const comic of MOCK_COMICS) {
            await setDoc(doc(db, 'comics', comic.id), comic);
          }
        } catch (error) {
          console.error("Seeding failed: ", error);
        }
      } else {
        actualComics.sort((a, b) => a.id.localeCompare(b.id));
        setComics(actualComics);
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
