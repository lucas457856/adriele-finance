import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { syncNotifications } from './notificationSync';

export async function loadAndSync() {
  console.log("==================================================");
  console.log("🔥 LOAD AND SYNC INICIADO");

  const clientesSnap = await getDocs(collection(db, 'clientes'));
  const vendasSnap = await getDocs(collection(db, 'vendas'));

  const clientes = clientesSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  const vendas = vendasSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log("📥 clientes:", clientes.length);
  console.log("📥 vendas:", vendas.length);

  console.log("🧪 PASSANDO PARA SYNC:");
  console.log("clientes OK?", !!clientes);
  console.log("vendas OK?", !!vendas);

  await syncNotifications(clientes, vendas); // ✅ CORRETO

  console.log('🔥 Firebase sincronizado');
}