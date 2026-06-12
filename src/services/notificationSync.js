import * as Notifications from 'expo-notifications';
import {
  initializeNotifications,
  NOTIFICATION_CHANNEL_ID,
} from './notificationSetup';

// ==================================================
// 🔥 FETCH
// ==================================================


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
// 🔑 IDENTIFICADOR ÚNICO
// ==================================================
function normalizeId(value) {
  return String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
}

function buildNotificationIdentifier(clienteId, vendaId, parcelaNumero) {
  return `cobranca_${normalizeId(clienteId)}_${normalizeId(vendaId)}_${normalizeId(parcelaNumero)}`;
}

// ==================================================
// 📋 MAPA DE NOTIFICAÇÕES AGENDADAS
// ==================================================
async function getScheduledNotificationsMap() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const map = new Map();

  for (const notification of scheduled) {
    if (notification.identifier) {
      map.set(notification.identifier, notification);
    }
  }

  console.log("📋 notificações já registradas no sistema:", map.size);

  return map;
}

// ==================================================
// 📅 TRIGGER POR DATA
// ==================================================
function buildDateTrigger(targetDate) {
  const triggerDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    0,
    0,
    0
  );

  const now = new Date();

  if (triggerDate.getTime() <= now.getTime()) {
    console.log("⚠️ data já passou ou é hoje → agendamento imediato em 1s");

    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      repeats: false,
      channelId: NOTIFICATION_CHANNEL_ID,
    };
  }

  console.log("📅 trigger DATE:", triggerDate.toLocaleString("pt-BR"));

  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerDate,
    channelId: NOTIFICATION_CHANNEL_ID,
  };
}

function getDateValue(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return new Date(value).getTime();
  return null;
}

function getTriggerSignature(trigger) {
  if (!trigger) return 'null';

  const channelId = trigger.channelId || null;

  if (
    trigger.type === Notifications.SchedulableTriggerInputTypes.DATE ||
    trigger.type === 'date'
  ) {
    return `date:${getDateValue(trigger.date)}:${channelId}`;
  }

  if (
    trigger.type === Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL ||
    trigger.type === 'timeInterval'
  ) {
    return `interval:${trigger.seconds ?? 0}:${trigger.repeats ?? false}:${channelId}`;
  }

  return JSON.stringify(trigger);
}

function getContentSignature(content) {
  return JSON.stringify({
    title: content.title,
    body: content.body,
    sound: content.sound,
    priority: content.priority,
    data: content.data,
  });
}

function notificationNeedsUpdate(existing, nextContent, nextTrigger) {
  if (!existing) return false;

  const existingContentSignature = getContentSignature(existing.content || {});
  const nextContentSignature = getContentSignature(nextContent);

  const existingTriggerSignature = getTriggerSignature(existing.trigger);
  const nextTriggerSignature = getTriggerSignature(nextTrigger);

  const contentChanged = existingContentSignature !== nextContentSignature;
  const triggerChanged = existingTriggerSignature !== nextTriggerSignature;

  console.log("🔎 notificação existente encontrada:", existing.identifier);
  console.log("🔎 conteúdo igual?", !contentChanged);
  console.log("🔎 trigger igual?", !triggerChanged);

  return contentChanged || triggerChanged;
}

// ==================================================
// 🔔 SCHEDULE
// ==================================================
async function scheduleNotification(message, targetDate, dataExtra, scheduledMap) {
  const identifier = buildNotificationIdentifier(
    dataExtra.clienteId,
    dataExtra.vendaId,
    dataExtra.parcelaNumero
  );

  const existing = scheduledMap.get(identifier);

  const content = {
    title: "Cobrança",
    body: message,
    sound: "default",
    priority: Notifications.AndroidNotificationPriority.MAX,
    data: dataExtra,
  };

  const trigger = buildDateTrigger(targetDate);

  console.log("🔑 identifier:", identifier);
  console.log("🔥 mensagem:", message);

  try {
    if (existing) {
      const needsUpdate = notificationNeedsUpdate(existing, content, trigger);

      if (!needsUpdate) {
        console.log("🚫 notificação ignorada: já existe e está igual");
        return { status: 'ignored', identifier };
      }

      console.log("🔄 notificacao existente será atualizada");
      await Notifications.cancelScheduledNotificationAsync(identifier);

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier,
        content,
        trigger,
      });

      scheduledMap.set(identifier, {
        identifier: notificationId,
        content,
        trigger,
      });

      console.log("✅ notificação atualizada:", notificationId);
      return { status: 'updated', identifier: notificationId };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier,
      content,
      trigger,
    });

    scheduledMap.set(identifier, {
      identifier: notificationId,
      content,
      trigger,
    });

    console.log("✅ notificação criada:", notificationId);
    return { status: 'created', identifier: notificationId };
  } catch (error) {
    console.error("❌ erro ao agendar notificação:", identifier, error);
    return { status: 'error', identifier, error };
  }
}

// ==================================================
// 📌 PARCELA
// ==================================================
async function scheduleParcela(cliente, venda, parcela, scheduledMap) {

  console.log("--------------------------------------------------");
  console.log("📌 PARCELA:", parcela.numero);

  if (parcela.paga) {
    console.log("🚫 notificação ignorada: parcela já paga");
    return { status: 'ignored', reason: 'paid' };
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

  if (!message) {
    console.log("🚫 notificação ignorada: sem regra de mensagem para estes dias");
    return { status: 'ignored', reason: 'no-message' };
  }

  return scheduleNotification(message, parcela.vencimento, {
    clienteId: cliente.id,
    vendaId: venda.id,
    parcelaNumero: parcela.numero,
  }, scheduledMap);
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

  const allowed = await initializeNotifications();

  if (!allowed) {
    console.warn("⚠️ sync finalizado sem agendar notificações: permissão negada");
    return {
      created: 0,
      updated: 0,
      ignored: 0,
      errors: 0,
    };
  }

  const scheduledMap = await getScheduledNotificationsMap();

  const stats = {
    created: 0,
    updated: 0,
    ignored: 0,
    errors: 0,
  };

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
        const result = await scheduleParcela(cliente, venda, parcela, scheduledMap);

        if (result.status === 'created') stats.created += 1;
        if (result.status === 'updated') stats.updated += 1;
        if (result.status === 'ignored') stats.ignored += 1;
        if (result.status === 'error') stats.errors += 1;
      }
    }
  }

  console.log("==================================================");
  console.log("📊 RESUMO DO SYNC");
  console.log("✅ criadas:", stats.created);
  console.log("🔄 atualizadas:", stats.updated);
  console.log("🚫 ignoradas:", stats.ignored);
  console.log("❌ erros:", stats.errors);
  console.log("🔥 SYNC FINALIZADO");

  return stats;
}
