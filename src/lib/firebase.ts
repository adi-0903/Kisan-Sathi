import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, setLogLevel, collection as realCollection, query as realQuery, where as realWhere, onSnapshot as realOnSnapshot, addDoc as realAddDoc, setDoc as realSetDoc, getDoc as realGetDoc, updateDoc as realUpdateDoc, doc as realDoc, deleteDoc as realDeleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

setLogLevel('silent');

// Initialize real Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth();

// --- RESILIENT HYBRID STORE ---

// Helper to check if Firebase database is offline or we face permission issues
let useLocalFallback = false;

// Shared active listeners for mock real-time updates
type Listener = {
  path: string;
  constraints: any[];
  onNext: (snapshot: any) => void;
};
const localListeners: Listener[] = [];

// Helper to get local storage data
function getLocalCollection(collectionName: string): any[] {
  try {
    const data = localStorage.getItem(`ks_db_${collectionName}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to parse local collection", e);
  }

  // Pre-seed search products to provide a gorgeous experience on first load
  if (collectionName === 'products') {
    const seeds = [
      {
        id: 'seed-tomato',
        supplierId: 'seed-farmer-1',
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        price: 40,
        unit: 'kg',
        quantity: 50,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
        status: 'Listed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-milk',
        supplierId: 'seed-farmer-2',
        name: 'Fresh Milk',
        category: 'Dairy',
        price: 60,
        unit: 'liter',
        quantity: 30,
        image: 'https://images.unsplash.com/photo-1550583724-b2692bcfff9e?auto=format&fit=crop&w=200&q=80',
        status: 'Listed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-wheat',
        supplierId: 'seed-farmer-1',
        name: 'Farm Wheat Flour',
        category: 'Grains',
        price: 45,
        unit: 'kg',
        quantity: 100,
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80',
        status: 'Listed',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('ks_db_products', JSON.stringify(seeds));
    return seeds;
  }
  return [];
}

function saveLocalCollection(collectionName: string, items: any[]) {
  try {
    localStorage.setItem(`ks_db_${collectionName}`, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save local collection", e);
  }
}

function triggerLocalListeners(collectionName: string) {
  const items = getLocalCollection(collectionName);
  const matchedListeners = localListeners.filter(l => l.path === collectionName);

  matchedListeners.forEach(l => {
    let filtered = [...items];
    l.constraints.forEach(c => {
      if (c && c._type === 'where') {
        const { field, op, value } = c;
        filtered = filtered.filter(item => {
          const itemVal = item[field];
          if (op === '==') return itemVal === value;
          if (op === '>=') return itemVal >= value;
          if (op === '<=') return itemVal <= value;
          return true;
        });
      }
    });

    const docs = filtered.map(item => ({
      id: item.id,
      data: () => item,
      ...item
    }));

    l.onNext({
      docs,
      forEach: (cb: any) => docs.forEach(cb)
    });
  });
}

// Transparent Firestore Mock Wrappers
export function collection(databaseInstance: any, name: string) {
  return { _type: 'collection', path: name };
}

export function doc(databaseInstance: any, collectionOrPath: any, ...childPaths: string[]) {
  if (collectionOrPath && collectionOrPath._type === 'collection') {
    return {
      _type: 'doc',
      collectionName: collectionOrPath.path,
      id: childPaths[0],
      path: `${collectionOrPath.path}/${childPaths[0]}`
    };
  }
  const fullPath = [collectionOrPath, ...childPaths].join('/');
  const segments = fullPath.split('/');
  return {
    _type: 'doc',
    collectionName: segments[0],
    id: segments[1],
    path: fullPath
  };
}

export function query(collectionRef: any, ...constraints: any[]) {
  return { _type: 'query', collectionRef, constraints };
}

export function where(field: string, op: string, value: any) {
  return { _type: 'where', field, op, value };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

const withTimeout = <T>(promise: Promise<T>, ms: number = 3000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
};

export async function addDoc(collectionRef: any, data: any) {
  const collectionName = collectionRef.path;
  const newId = Math.random().toString(36).substring(2, 10);
  const docData = {
    id: newId,
    ...data,
    createdAt: data.createdAt === 'serverTimestamp' || !data.createdAt ? new Date().toISOString() : data.createdAt
  };

  // Attempt real Firestore write
  if (!useLocalFallback) {
    try {
      const realColl = realCollection(db, collectionName);
      await withTimeout(realAddDoc(realColl, data));
    } catch (e: any) {
      console.warn("Firestore real addDoc failed, enabling local fallback:", e.message);
      useLocalFallback = true;
    }
  }

  // Always write locally for resilience
  const items = getLocalCollection(collectionName);
  items.push(docData);
  saveLocalCollection(collectionName, items);
  triggerLocalListeners(collectionName);

  return { id: newId };
}

export async function setDoc(docRef: any, data: any) {
  const { collectionName, id } = docRef;
  
  // Attempt real Firestore write
  if (!useLocalFallback) {
    try {
      const realDocRef = realDoc(db, collectionName, id);
      await withTimeout(realSetDoc(realDocRef, data));
    } catch (e: any) {
      console.warn("Firestore real setDoc failed, enabling local fallback:", e.message);
      useLocalFallback = true;
    }
  }

  // Always write locally for resilience
  const items = getLocalCollection(collectionName);
  const index = items.findIndex(item => item.id === id || item.uid === id);
  const docData = { id, uid: id, ...data };
  
  if (index !== -1) {
    items[index] = docData;
  } else {
    items.push(docData);
  }
  
  saveLocalCollection(collectionName, items);
  triggerLocalListeners(collectionName);
}

export async function getDoc(docRef: any) {
  const { collectionName, id } = docRef;

  // Attempt real Firestore read
  if (!useLocalFallback) {
    try {
      const realDocRef = realDoc(db, collectionName, id);
      const snapshot = await withTimeout(realGetDoc(realDocRef));
      if (snapshot.exists()) {
        return {
          exists: () => true,
          data: () => snapshot.data()
        };
      }
    } catch (e: any) {
      console.warn("Firestore real getDoc failed, enabling local fallback:", e.message);
      useLocalFallback = true;
    }
  }

  // Fallback to local
  const items = getLocalCollection(collectionName);
  const found = items.find(item => item.id === id || item.uid === id);
  return {
    exists: () => !!found,
    data: () => found
  };
}

export async function updateDoc(docRef: any, data: any) {
  const { collectionName, id } = docRef;

  // Attempt real Firestore update
  if (!useLocalFallback) {
    try {
      const realDocRef = realDoc(db, collectionName, id);
      await withTimeout(realUpdateDoc(realDocRef, data));
    } catch (e: any) {
      console.warn("Firestore real updateDoc failed, enabling local fallback:", e.message);
      useLocalFallback = true;
    }
  }

  // Always write locally for resilience
  const items = getLocalCollection(collectionName);
  const index = items.findIndex(item => item.id === id || item.uid === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    saveLocalCollection(collectionName, items);
    triggerLocalListeners(collectionName);
  }
}

export async function deleteDoc(docRef: any) {
  const { collectionName, id } = docRef;

  if (!useLocalFallback) {
    try {
      const realDocRef = realDoc(db, collectionName, id);
      await withTimeout(realDeleteDoc(realDocRef));
    } catch (e: any) {
      console.warn("Firestore real deleteDoc failed, enabling local fallback:", e.message);
      useLocalFallback = true;
    }
  }

  const items = getLocalCollection(collectionName);
  const updatedItems = items.filter(item => item.id !== id && item.uid !== id);
  saveLocalCollection(collectionName, updatedItems);
  triggerLocalListeners(collectionName);
}

export function onSnapshot(queryOrRef: any, onNext: (snap: any) => void, onError?: (err: any) => void) {
  const isQuery = queryOrRef._type === 'query';
  const collectionName = isQuery ? queryOrRef.collectionRef.path : queryOrRef.path;
  const constraints = isQuery ? queryOrRef.constraints : [];

  // Register local listener
  const listener: Listener = {
    path: collectionName,
    constraints,
    onNext
  };
  localListeners.push(listener);

  // Trigger once immediately with local cache
  const localItems = getLocalCollection(collectionName);
  let filtered = [...localItems];
  constraints.forEach(c => {
    if (c && c._type === 'where') {
      const { field, op, value } = c;
      filtered = filtered.filter(item => {
        const itemVal = item[field];
        if (op === '==') return itemVal === value;
        if (op === '>=') return itemVal >= value;
        if (op === '<=') return itemVal <= value;
        return true;
      });
    }
  });

  const localDocs = filtered.map(item => ({
    id: item.id || item.uid,
    data: () => item,
    ...item
  }));

  // Immediate emission from local storage so UI is never blank
  setTimeout(() => {
    onNext({
      docs: localDocs,
      forEach: (cb: any) => localDocs.forEach(cb)
    });
  }, 0);

  // Try real Firestore listener if fallback is not active
  let realUnsubscribe: any = null;
  if (!useLocalFallback) {
    try {
      const realColl = realCollection(db, collectionName);
      let realQ = realQuery(realColl);
      
      // Apply constraints to real query
      constraints.forEach(c => {
        if (c && c._type === 'where') {
          realQ = realQuery(realQ, realWhere(c.field, c.op, c.value));
        }
      });

      realUnsubscribe = realOnSnapshot(realQ, (snap) => {
        const docs = snap.docs.map(d => ({
          id: d.id,
          data: () => d.data(),
          ...d.data()
        }));
        
        // Update local cache so offline works next time
        const existingLocal = getLocalCollection(collectionName);
        docs.forEach(realDoc => {
          const idx = existingLocal.findIndex(l => l.id === realDoc.id);
          if (idx !== -1) {
            existingLocal[idx] = realDoc;
          } else {
            existingLocal.push(realDoc);
          }
        });
        saveLocalCollection(collectionName, existingLocal);

        onNext({
          docs,
          forEach: (cb: any) => docs.forEach(cb)
        });
      }, (err) => {
        console.warn(`Firestore real onSnapshot error for ${collectionName}:`, err.message);
        useLocalFallback = true;
        if (onError) onError(err);
      });
    } catch (e) {
      console.warn("Firestore setup subscriber failed:", e);
      useLocalFallback = true;
    }
  }

  // Return unsubscribe function
  return () => {
    const idx = localListeners.indexOf(listener);
    if (idx !== -1) {
      localListeners.splice(idx, 1);
    }
    if (realUnsubscribe) {
      realUnsubscribe();
    }
  };
}
