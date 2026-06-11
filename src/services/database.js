import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

const clientesRef = collection(db, 'clientes');


// 🔥 CRIAR CLIENTE
export const addCliente = async (cliente) => {
  try {
    const ref = await addDoc(clientesRef, cliente);

    // opcional: salvar ID dentro do documento
    await updateDoc(ref, {
      uid: ref.id
    });

    console.log("✅ SALVO ID:", ref.id);
    return ref;
  } catch (error) {
    console.log("❌ ERRO ADD:", error);
    throw error;
  }
};


// 🔥 BUSCAR CLIENTES (NORMAL)
export const getClientes = async () => {
  try {
    const snapshot = await getDocs(clientesRef);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.log("❌ ERRO GET:", error);
    throw error;
  }
};


// 🔥 TEMPO REAL (CORRIGE SEU ERRO)
export const subscribeClientes = (callback) => {
  return onSnapshot(clientesRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(data);
  });
};


// 🔥 DELETAR
export const deleteCliente = async (id) => {
  try {
    const ref = doc(db, 'clientes', id);
    await deleteDoc(ref);
    console.log("🔥 DELETE EXECUTADO");
  } catch (error) {
    console.log("❌ ERRO DELETE:", error);
  }
};


// 🔥 ATUALIZAR
export const updateCliente = async (id, clienteAtualizado) => {
  try {
    const ref = doc(db, 'clientes', id);
    await updateDoc(ref, clienteAtualizado);
    console.log("✅ CLIENTE ATUALIZADO");
  } catch (error) {
    console.log("❌ ERRO UPDATE:", error);
    throw error;
  }
};