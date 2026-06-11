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

// 🔥 ALTERADO: Agora aponta para a coleção 'vendas'
const vendasRef = collection(db, 'vendas');

// ================= ADD =================
export const addContrato = async (contrato) => {
  try {
    const ref = await addDoc(vendasRef, {
      ...contrato,
      parcelasPagas: [] // 🔥 nunca undefined
    });

    console.log("✅ Venda salva com sucesso:", ref.id);
    return ref;

  } catch (error) {
    console.log("❌ erro ao adicionar venda:", error);
    throw error;
  }
};

// ================= GET =================
export const getContratos = async () => {
  try {
    const snap = await getDocs(vendasRef);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      parcelasPagas: doc.data().parcelasPagas || []
    }));

  } catch (error) {
    console.log("❌ erro ao buscar vendas:", error);
    throw error;
  }
};

// ================= 🔥 TEMPO REAL =================
export const subscribeContratos = (callback) => {
  return onSnapshot(vendasRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      parcelasPagas: doc.data().parcelasPagas || []
    }));

    callback(data);
  });
};

// ================= DELETE =================
export const deleteContrato = async (id) => {
  try {
    await deleteDoc(doc(db, 'vendas', id));
    console.log("🗑️ Venda deletada");

  } catch (error) {
    console.log("❌ erro ao deletar venda:", error);
    throw error;
  }
};

// ================= UPDATE =================
export const updateContrato = async (id, data) => {
  try {
    await updateDoc(doc(db, 'vendas', id), {
      ...data
    });

    console.log("✅ Venda atualizada");

  } catch (error) {
    console.log("❌ erro ao atualizar venda:", error);
    throw error;
  }
};
