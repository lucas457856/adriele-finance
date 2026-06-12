import * as Notifications from 'expo-notifications';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// ==================================================
// 🔥 FETCH
// ==================================================
export async function fetchData() {
  console.log("==================================================");
  console.log("🔥 LOAD AND SYNC INICIADO");

  const clientesSnap = await getDocs(collection(db, "clientes"));
  const vendasSnap = await getDocs(collection(db, "vendas"));

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

  return { clientes, vendas };
}

// ==================================================
// 🧹 CLEAR
// ==================================================
async function clearNotifications() {
  console.log("🧹 Limpando notificações...");
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ==================================================
// 📅 HOJE (CELULAR REAL)
// ==================================================
function getHoje() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// ==================================================
// 📅 PARSE DATA BR (SEM BUG)
// ==================================================
function parseDataBR(data) {
  if (!data) return null;

  const [dia, mes, ano] = data.split("/");

  const d = new Date(ano, mes - 1, dia);
  d.setHours(0, 0, 0, 0);

  console.log("📅 parseDataBR:", data, "=>", d.toLocaleDateString("pt-BR"));

  return d;
}

// ==================================================
// 📆 DIFERENÇA REAL (BANCO)
// ==================================================
function diffDays(target) {

  const hoje = getHoje();
  const venc = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const dias = Math.round((venc - hoje) / (1000 * 60 * 60 * 24));

  console.log("📅 hoje:", hoje.toLocaleDateString("pt-BR"));
  console.log("📅 vencimento:", venc.toLocaleDateString("pt-BR"));
  console.log("📅 DIAS (BANCO FIX):", dias);

  return dias;
}

// ==================================================
// 📦 PARCELAS
// ==================================================
function gerarParcelas(venda) {
  const base = parseDataBR(venda.data);
  const intervalo = Number(venda.intervaloDias || 30);
  const total = Number(venda.parcelas || 1);

  const lista = [];

  for (let i = 1; i <= total; i++) {

const vencimento = new Date(base);

// 🔥 PRIMEIRA PARCELA COMEÇA NO DIA SEGUINTE
vencimento.setDate(vencimento.getDate() + 1 + (intervalo * (i - 1)));
vencimento.setHours(0, 0, 0, 0);

    console.log(`📅 Parcela ${i}:`, vencimento.toLocaleDateString("pt-BR"));

    lista.push({
      numero: i,
      vencimento,
      valor: venda.valorParcela || venda.valor,
      paga: (venda.parcelasPagas || []).includes(i),
    });
  }

  return lista;
}

// ==================================================
// 💬 MENSAGENS (BANCO)
// ==================================================
function buildMessage(cliente, parcela, total, valor, dias) {

  const nome = cliente.nome;

  console.log("💬 buildMessage dias:", dias);

  if (dias === 7) {
    return `Atenção! A ${parcela.numero}ª parcela de ${total}, no valor de ${valor}, do cliente ${nome}, vence em 7 dias. Verifique o pagamento para evitar atrasos.`;
  }

  if (dias === 3) {
    return `Lembrete: A ${parcela.numero}ª parcela de ${total}, no valor de ${valor}, do cliente ${nome}, vence em 3 dias.`;
  }

  if (dias === 1) {
    return `Lembrete: A ${parcela.numero}ª parcela de ${total}, no valor de ${valor}, do cliente ${nome}, vence em 1 dia.`;
  }

  if (dias === 0) {
    return `Lembrete: A ${parcela.numero}ª parcela de ${total}, no valor de ${valor}, do cliente ${nome}, vence hoje.`;
  }

  if (dias === -1) {
    return `Atenção! A ${parcela.numero}ª parcela de ${total}, no valor de ${valor}, do cliente ${nome}, venceu ontem e ainda não foi registrada como paga.`;
  }

  if (dias <= -5 && dias > -10) {
    return `Aviso: A ${parcela.numero}ª parcela de ${total}, no valor de ${valor}, do cliente ${nome}, está vencida há alguns dias. Verifique a situação do pagamento.`;
  }

  if (dias <= -10) {
    return `Importante: A ${parcela.numero}ª parcela de ${total}, no valor de ${valor}, do cliente ${nome}, está vencida há muitos dias e permanece pendente.`;
  }

  return null;
}

// ==================================================
// 🔔 SCHEDULE
// ==================================================
async function scheduleNotification(message, targetDate, dataExtra) {

  const now = getHoje();
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const rawSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

  console.log("⏱️ raw seconds:", rawSeconds);

  let seconds = rawSeconds;

  if (seconds <= 0) {
    console.log("⚠️ data já passou ou é hoje → fallback 60s");
    seconds = 60;
  }

  console.log("⏱️ agendando em segundos:", seconds);
  console.log("🔥 mensagem:", message);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Cobrança",
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: dataExtra,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });

  console.log("✅ notificação criada");
}

// ==================================================
// 📌 PARCELA
// ==================================================
async function scheduleParcela(cliente, venda, parcela) {

  console.log("--------------------------------------------------");
  console.log("📌 PARCELA:", parcela.numero);

  if (parcela.paga) {
    console.log("✅ já paga");
    return;
  }

  const total = Number(venda.parcelas || 1);

  const valor = Number(parcela.valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const dias = diffDays(parcela.vencimento);

  const message = buildMessage(cliente, parcela, total, valor, dias);

  console.log("👤 cliente:", cliente.nome);
  console.log("💰 venda:", venda.id);
  console.log("📅 dias:", dias);
  console.log("🔥 mensagem:", message);

  if (!message) return;

  await scheduleNotification(message, parcela.vencimento, {
    clienteId: cliente.id,
    vendaId: venda.id,
    parcelaNumero: parcela.numero,
  });
}

// ==================================================
// 🔍 MATCH
// ==================================================
function matchVendas(cliente, vendas) {
  const ids = [cliente.id, cliente.uid];
  return vendas.filter(v => ids.includes(v.clienteId));
}

// ==================================================
// 🚀 SYNC
// ==================================================
export async function syncNotifications(clientes, vendas) {

  console.log("==================================================");
  console.log("🔥 SYNC INICIADO");

  await clearNotifications();

  for (const cliente of clientes) {

    console.log("==================================================");
    console.log("👤 CLIENTE:", cliente.nome);

    const vendasCliente = matchVendas(cliente, vendas);

    console.log("🔍 vendas encontradas:", vendasCliente.length);

    for (const venda of vendasCliente) {

      console.log("📦 VENDA:", venda.id);

      const parcelas = gerarParcelas(venda);

      console.log("🧾 parcelas:", parcelas.length);

      for (const parcela of parcelas) {
        await scheduleParcela(cliente, venda, parcela);
      }
    }
  }

  console.log("🔥 SYNC FINALIZADO");
}

// ==================================================
// 🚀 ENTRY
// ==================================================
export async function runFullSync() {
  const { clientes, vendas } = await fetchData();
  await syncNotifications(clientes, vendas);
}