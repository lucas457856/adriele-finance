import * as Notifications from 'expo-notifications';

// 🔥 SETA O COMPORTAMENTO GLOBAL
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 🔥 CONVERTE DIAS EM SEGUNDOS PARA O EXPO
function getSecondsUntilTrigger(vencimento, days) {
  const targetDate = new Date(vencimento);

  targetDate.setDate(targetDate.getDate() + days);

  const now = new Date();

  let seconds = Math.floor((targetDate - now) / 1000);

  if (seconds < 5) seconds = 5;

  return seconds;
}

// 🔥 TRIGGERS (SUAS MENSAGENS)
const buildTriggers = (parcela, totalParcelas, valorParcela, nomeCliente) => [
  {
    days: -7,
    title: '🔔 Aviso de Cobrança',
    body: `A ${parcela.numero}ª parcela de ${totalParcelas}, no valor de ${valorParcela}, do cliente ${nomeCliente}, vence em 7 dias.`,
  },
  {
    days: -3,
    title: '⏳ Lembrete',
    body: `A ${parcela.numero}ª parcela de ${totalParcelas}, no valor de ${valorParcela}, do cliente ${nomeCliente}, vence em 3 dias.`,
  },
  {
    days: 0,
    title: '🚨 Vence Hoje',
    body: `A ${parcela.numero}ª parcela de ${totalParcelas}, no valor de ${valorParcela}, do cliente ${nomeCliente}, vence hoje.`,
  },
  {
    days: 1,
    title: '⚠️ Parcela em Atraso',
    body: `A ${parcela.numero}ª parcela de ${totalParcelas}, no valor de ${valorParcela}, do cliente ${nomeCliente}, venceu ontem e ainda não foi registrada como paga.`,
  },
  {
    days: 5,
    title: '⚠️ Cobrança Pendente',
    body: `A ${parcela.numero}ª parcela de ${totalParcelas}, no valor de ${valorParcela}, do cliente ${nomeCliente}, está vencida há 5 dias.`,
  },
  {
    days: 10,
    title: '🚨 Atenção',
    body: `A ${parcela.numero}ª parcela de ${totalParcelas}, no valor de ${valorParcela}, do cliente ${nomeCliente}, está vencida há 10 dias e permanece pendente.`,
  },
];

// 🔥 AGENDA TODAS NOTIFICAÇÕES DA PARCELA
export async function scheduleParcelaNotifications(
  contrato,
  parcela,
  nomeCliente
) {
  if (parcela.paga) return;

  const totalParcelas = contrato.parcelas || 1;

  const valorParcela = Number(
    contrato.valorParcela || parcela.valor || 0
  ).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const triggers = buildTriggers(
    parcela,
    totalParcelas,
    valorParcela,
    nomeCliente
  );

  for (const t of triggers) {
    const seconds = getSecondsUntilTrigger(
      parcela.vencimento,
      t.days
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t.title,
        body: t.body,
        data: {
          contratoId: contrato.id,
          parcelaNumero: parcela.numero,
        },
      },
      trigger: {
        seconds,
      },
    });
  }
}