import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { FontAwesome, Ionicons } from '@expo/vector-icons';


import ContractModal from '../components/ContractModal';
import { ThemeContext } from '../context/ThemeContext';
import {
  deleteContrato,
  subscribeContratos,
  updateContrato
} from '../services/contracts';
import { subscribeClientes } from '../services/database';



// ─── Palette Fixa (Cores de Destaque) ───────────────────────────────────────
const ACCENT  = '#A78BFA';
const GREEN   = '#34D399';
const RED     = '#F87171';
const BLUE    = '#60A5FA';
const YELLOW  = '#FBBF24';
const ORANGE  = '#FB923C';

export default function ListContracts({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.dark;

  // ── Cores Dinâmicas (Baseadas no Tema do CustomDrawer) ────────────────────
  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? '#161B27' : '#FFFFFF';
  const card2  = isDark ? '#1C2235' : '#F9FAFB';
  const border = isDark ? '#1E2330' : '#E2E6F0';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';

  const [clientes, setClientes]   = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading]     = useState(true);

  const [selected, setSelected]               = useState(null);
  const [modalDetails, setModalDetails]       = useState(false);
  const [modalCreate, setModalCreate]         = useState(false);
  const [modalAmortizacao, setModalAmortizacao] = useState(false);
  const [valorAmortizacao, setValorAmortizacao] = useState('');
  const [modalPagamento, setModalPagamento]   = useState(false);
  const [valorPagamento, setValorPagamento]   = useState('');
  const [modalConfirmar, setModalConfirmar]   = useState(false);
  const [parcelaConfirmar, setParcelaConfirmar] = useState(null);
  const [tipoAcao, setTipoAcao]               = useState(null);

  const mesSelecionado = route?.params?.mes;
  const nomesMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const getNomeCliente = (id) => clientes.find(c => c.id === id)?.nome ?? '…';
  const getTelCliente  = (id) => clientes.find(c => c.id === id)?.telefone ?? null;

  const money = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getMes = (dataStr) => {
    if (!dataStr) return null;
    const [d, m, y] = dataStr.split('/');
    return nomesMeses[new Date(`${y}-${m}-${d}`).getMonth()];
  };

  const getSituacao = (c) =>
    (c.parcelasPagas?.length || 0) >= c.parcelas ? 'Quitado' : 'Em Aberto';

  function formatBRDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

  const gerarParcelas = (c) => {
    const parcelas  = Number(c.parcelas) || 0;
    const intervalo = Number(c.intervaloDias) || 0;
    if (!c.data) return [];
    const [d, m, y] = c.data.split('/');
    let dt = new Date(y, m - 1, d);
    return Array.from({ length: parcelas }, (_, i) => {
      dt.setDate(dt.getDate() + intervalo);
      return { 
  numero: i + 1, 
  vencimento: formatBRDate(dt)
};
    });
  };

  useEffect(() => {
    const unsub1 = subscribeContratos(setContratos);
    const unsub2 = subscribeClientes(setClientes);
    setLoading(false);
    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => {
    if (route?.params?.abrirContrato) {
      openDetails(route.params.abrirContrato);
      navigation.setParams({ abrirContrato: null });
    }
  }, [route?.params, navigation]);

  const openDetails = (item) => { setSelected(item); setModalDetails(true); };

const pagarDireto = async (parcela) => {
  if (!selected) return;

  console.log("📌 BAIXANDO PARCELA:", parcela.numero);

  const ref = selected.id;

  const atuais = selected.parcelasPagas || [];

  const jaExiste = atuais.includes(parcela.numero);

  const novosPagos = jaExiste
    ? atuais
    : [...atuais, parcela.numero];

  const vParcela = Number(selected.valorParcela) || 0;
  const totalAtual = Number(selected.totalReceber) || 0;

  const novoTotal = Math.max(0, totalAtual - vParcela);

  const updated = {
    ...selected,
    parcelasPagas: novosPagos,
    totalReceber: novoTotal,
  };

  console.log("🔥 Atualizando Firestore...");

  await updateContrato(ref, {
    parcelasPagas: novosPagos,
    totalReceber: novoTotal,
  });

  console.log("✅ Firestore atualizado");

  // 🔥 força atualização imediata na tela
  setSelected(updated);

  setContratos(prev =>
    prev.map(c =>
      c.id === ref ? updated : c
    )
  );

  console.log("🔄 UI atualizada");
};


  const baixarJuros = async (parcela) => {
    if (!selected) return;

    // 1. Cancela as notificações desta parcela
    // await cancelPaymentReminders(selected, parcela); // 🔥 ADICIONE ISSO

    const total = Number(selected.totalReceber) || 0;
    const vParc = total / (Number(selected.parcelasOriginais) || 1);
    const jpList = [...(selected.parcelasJurosPagos || [])];
    if (!jpList.includes(parcela.numero)) jpList.push(parcela.numero);
    const updated = { ...selected, parcelas: Number(selected.parcelas) + 1, parcelasJurosPagos: jpList };
    await updateContrato(selected.id, { parcelas: updated.parcelas, parcelasJurosPagos: jpList, valorParcelaFixa: vParc });
    setSelected(updated);
    setContratos(prev => prev.map(c => c.id === selected.id ? updated : c));
  };


  const handleDelete = async () => {
    if (!selected) return;
    await deleteContrato(selected.id);
    setModalDetails(false);
    setContratos(prev => prev.filter(c => c.id !== selected.id));
  };

  const enviarWhatsApp = (contrato, parcela) => {
    const nome     = getNomeCliente(contrato.clienteId);
    const telefone = getTelCliente(contrato.clienteId);
    if (!telefone) { alert('Cliente sem telefone'); return; }
    const vParc    = Number(contrato.valorParcela) || 0;
    const numP     = `${parcela.numero}ª`;
    const item     = contrato.produto ? `(${contrato.produto})` : '';
    const desc     = `pedido ${item}da ${contrato.marca || 'loja'}`;
    const pago     = contrato.parcelasPagas?.includes(parcela.numero);

    let msg = "";

    if (pago) {
      msg = `Olá, ${nome}! Tudo bem? ✨\n\nAcabei de dar baixa no pagamento da sua ${numP} parcela do seu ${desc}!\n\n💰 Valor: ${money(vParc)}\n\nMuito obrigada pelo pagamento e pela pontualidade! 😊`;
    } else {
      // 🔥 MENSAGEM EXATAMENTE COMO VOCÊ PEDIU
      msg = `Olá, ${nome}! Tudo bem? ✨\n\n` +
            `Passando para lembrar que a sua ${numP} parcela do seu ${desc} vence no próximo dia ${parcela.vencimento}.\n\n` +
            `💰 Valor: ${money(vParc)}\n\n` +
            `Formas de pagamentos: Cartão Pix ou Dinheiro.\n` +
            `Se preferir outra opção só chamar! 😊\n\n` +
            `Segue os dados\n` +
            `🔑 Chave Pix: 85999288032\n` +
            `Adriana Goncalves dos Santos\n` +
            `🏦 Banco: Mercado Pago`;
    }

    Linking.openURL(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`);
  };


  const contratosFiltrados = mesSelecionado
    ? contratos.filter(c => getMes(c.data) === mesSelecionado)
    : contratos;

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={ACCENT} />
      <Text style={{ color: sub, marginTop: 12, fontSize: 13 }}>Carregando…</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>

      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: border,
      }}>
        <View>
          {mesSelecionado && (
            <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
              {mesSelecionado}
            </Text>
          )}
          <Text style={{ color: txt, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
            Vendas
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setModalCreate(true)}
            style={{
              backgroundColor: ACCENT,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 12,
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Nova</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            style={{
              backgroundColor: card,
              borderRadius: 12,
              padding: 9,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Ionicons name="close" size={20} color={sub} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── List ── */}
      <FlatList
        data={contratosFiltrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const quitado = getSituacao(item) === 'Quitado';
          const pagas   = item.parcelasPagas?.length || 0;
          const total   = item.parcelas || 1;
          const prog    = pagas / total;
          return (
            <TouchableOpacity
              onPress={() => openDetails(item)}
              activeOpacity={0.75}
              style={{
                backgroundColor: card,
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: sub, fontSize: 11, letterSpacing: 0.4 }}>
                  Venda #{item.numeroContrato}
                </Text>
                <View style={{
                  backgroundColor: quitado ? '#052e16' : (isDark ? '#1a1a2e' : '#eef2ff'),
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  borderRadius: 20,
                }}>
                  <Text style={{ color: quitado ? GREEN : ACCENT, fontSize: 11, fontWeight: '600' }}>
                    {quitado ? '✓ Quitado' : 'Em Aberto'}
                  </Text>
                </View>
              </View>

              <Text style={{ color: txt, fontWeight: '700', fontSize: 16, marginBottom: 4 }}>
                {getNomeCliente(item.clienteId)}
              </Text>
              <Text style={{ color: sub, fontSize: 12, marginBottom: 12 }}>
                {item.marca}  ·  {item.produto}
              </Text>

              <View style={{ height: 4, backgroundColor: border, borderRadius: 4, marginBottom: 8 }}>
                <View style={{
                  height: 4,
                  width: `${prog * 100}%`,
                  backgroundColor: quitado ? GREEN : ACCENT,
                  borderRadius: 4,
                }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: sub, fontSize: 11 }}>
                  {pagas}/{total} parcelas
                </Text>
                <Text style={{ color: GREEN, fontWeight: '700', fontSize: 14 }}>
                  {money(item.totalReceber)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* ════════ MODAL DETALHES ════════ */}
      <Modal visible={modalDetails} animationType="slide">
        <View style={{ flex: 1, backgroundColor: bg }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 52,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: border,
          }}>
            <Text style={{ color: txt, fontSize: 18, fontWeight: '700' }}>
              Detalhes da Venda
            </Text>
            <TouchableOpacity
              onPress={() => setModalDetails(false)}
              style={{ backgroundColor: card, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: border }}
            >
              <Ionicons name="close" size={20} color={sub} />
            </TouchableOpacity>
          </View>

          {selected && (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
              <View style={{
                backgroundColor: card,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: border,
                overflow: 'hidden',
              }}>
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  backgroundColor: ACCENT, borderTopLeftRadius: 20, borderTopRightRadius: 20,
                }} />

                <Text style={{ color: txt, fontSize: 20, fontWeight: '800', marginBottom: 14 }}>
                  {getNomeCliente(selected.clienteId)}
                </Text>

                <InfoRow icon="diamond-outline" color={BLUE}   label="Marca"   value={selected.marca} txtColor={txt} subColor={sub} />
                <InfoRow icon="pricetag-outline" color={YELLOW} label="Tipo"    value={selected.tipo} txtColor={txt} subColor={sub} />
                <InfoRow icon="bag-outline"      color={ACCENT} label="Produto" value={selected.produto} txtColor={txt} subColor={sub} />

                <View style={{ height: 1, backgroundColor: border, marginVertical: 14 }} />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <MiniStat label="Valor"   value={money(selected.valor)}           color={txt} subColor={sub} cardBg={card2} borderCol={border} />
                  <MiniStat label="Entrada" value={money(selected.entrada || 0)}    color={GREEN} subColor={sub} cardBg={card2} borderCol={border} />
                </View>

                <View style={{ height: 1, backgroundColor: border, marginVertical: 14 }} />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <MiniStat
                    label="Parcelas"
                    value={`${selected.parcelas}x ${money(selected.valorParcela)}`}
                    color={txt} subColor={sub} cardBg={card2} borderCol={border}
                  />
                  <MiniStat
                    label="Pagas"
                    value={`${selected.parcelasPagas?.length || 0}/${selected.parcelas}`}
                    color={GREEN} subColor={sub} cardBg={card2} borderCol={border}
                  />
                </View>

                <View style={{ height: 1, backgroundColor: border, marginVertical: 14 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: sub, fontSize: 12 }}>Falta receber</Text>
                  <Text style={{ color: RED, fontSize: 18, fontWeight: '800' }}>
                    {money(selected.totalReceber)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <ActionBtn
                  icon="cash-outline"
                  label="Amortizar"
                  color={GREEN}
                  onPress={() => setModalAmortizacao(true)}
                />
                <ActionBtn
                  icon="arrow-down-circle-outline"
                  label="Acréscimo"
                  color={BLUE}
                  onPress={() => { setValorPagamento(''); setModalPagamento(true); }}
                />
                <ActionBtn
                  icon="trash-outline"
                  label="Excluir"
                  color={RED}
                  onPress={() => { setTipoAcao('delete'); setModalConfirmar(true); }}
                />
              </View>

              <Text style={{ color: sub, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>
                Parcelas
              </Text>

              {gerarParcelas(selected).map((p) => {
                const pago      = selected.parcelasPagas?.includes(p.numero);
                const jurosPago = selected.parcelasJurosPagos?.includes(p.numero);
                return (
                  <View key={p.numero} style={{
                    backgroundColor: card,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: pago ? '#052e16' : border,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: sub, fontSize: 12 }}>Parcela {p.numero}</Text>
                      <Text style={{ color: sub, fontSize: 12 }}>{p.vencimento}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: txt, fontWeight: '700', fontSize: 15 }}>
                        {money(selected.valorParcela)}
                      </Text>

                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        {pago ? (
                          <StatusPill label="✓ Pago" color={GREEN} bg="#052e16" />
                        ) : jurosPago ? (
                          <StatusPill label="💸 Juros" color={ORANGE} bg="#1c1008" />
                        ) : (
                          <TouchableOpacity
                            onPress={() => { setParcelaConfirmar(p); setTipoAcao('normal'); setModalConfirmar(true); }}
                            style={{
                              backgroundColor: ACCENT + '22',
                              borderWidth: 1,
                              borderColor: ACCENT,
                              paddingHorizontal: 14,
                              paddingVertical: 6,
                              borderRadius: 10,
                            }}
                          >
                            <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '600' }}>Baixar</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => enviarWhatsApp(selected, p)}
                          style={{
                            backgroundColor: '#075E54',
                            width: 36, height: 36,
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <FontAwesome name="whatsapp" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* MODAL AMORTIZAR */}
      <Modal visible={modalAmortizacao} animationType="slide">
        <View style={{ flex: 1, backgroundColor: bg, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 }}>
            <Text style={{ color: txt, fontSize: 20, fontWeight: '700' }}>Amortizar Saldo</Text>
            <TouchableOpacity onPress={() => setModalAmortizacao(false)}>
              <Ionicons name="close" size={24} color={sub} />
            </TouchableOpacity>
          </View>

          {selected && (
            <>
              <View style={{ backgroundColor: card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: border, marginBottom: 16 }}>
                <Text style={{ color: sub, fontSize: 12 }}>Saldo atual</Text>
                <Text style={{ color: txt, fontSize: 22, fontWeight: '800' }}>{money(selected.totalReceber)}</Text>
              </View>
              <StyledInput placeholder="Valor a amortizar" value={valorAmortizacao} onChangeText={setValorAmortizacao} txtColor={txt} subColor={sub} cardBg={card2} borderCol={border} />
              <TouchableOpacity
                onPress={async () => {
                  const nTotal = Math.max(0, Number(selected.totalReceber) - Number(valorAmortizacao));
                  await updateContrato(selected.id, { totalReceber: nTotal });
                  setSelected({ ...selected, totalReceber: nTotal });
                  setModalAmortizacao(false);
                  setValorAmortizacao('');
                }}
                style={{ backgroundColor: GREEN, padding: 16, borderRadius: 14, marginTop: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalAmortizacao(false)} style={{ padding: 16, borderRadius: 14, marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: sub, fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* MODAL ACRÉSCIMO */}
      <Modal visible={modalPagamento} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 24 }}>
          {selected && (
            <View style={{ backgroundColor: card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: border }}>
              <Text style={{ color: txt, fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Acréscimo</Text>
              <Text style={{ color: sub, fontSize: 12, marginBottom: 16 }}>Venda #{selected.numeroContrato}</Text>
              <StyledInput placeholder="Valor a acrescentar" value={valorPagamento} onChangeText={setValorPagamento} txtColor={txt} subColor={sub} cardBg={card2} borderCol={border} />
              <TouchableOpacity
                onPress={async () => {
                  const nTotal = Math.max(0, Number(selected.totalReceber) + Number(valorPagamento));
                  await updateContrato(selected.id, { totalReceber: nTotal });
                  setSelected({ ...selected, totalReceber: nTotal });
                  setModalPagamento(false);
                  setValorPagamento('');
                }}
                style={{ backgroundColor: BLUE, padding: 14, borderRadius: 12, marginTop: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalPagamento(false)} style={{ padding: 14, alignItems: 'center' }}>
                <Text style={{ color: sub }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* MODAL CONFIRMAR */}
      <Modal visible={modalConfirmar} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 24 }}>
          {selected && (
            <View style={{ backgroundColor: card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: border }}>
              <Text style={{ color: txt, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                {tipoAcao === 'juros'  ? 'Baixar juros?'    :
                 tipoAcao === 'delete' ? 'Excluir venda?'   : 'Baixar parcela?'}
              </Text>
              <Text style={{ color: sub, fontSize: 13, marginBottom: 24 }}>
                {tipoAcao === 'delete' ? 'Esta ação não pode ser desfeita.' : `Parcela ${parcelaConfirmar?.numero} · ${parcelaConfirmar?.vencimento}`}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setModalConfirmar(false)}
                  style={{ flex: 1, backgroundColor: card2, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: border }}
                >
                  <Text style={{ color: sub, fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (tipoAcao === 'juros')       baixarJuros(parcelaConfirmar);
                    else if (tipoAcao === 'delete') handleDelete();
                    else                            pagarDireto(parcelaConfirmar);
                    setModalConfirmar(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: tipoAcao === 'delete' ? RED : ACCENT,
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <ContractModal visible={modalCreate} onClose={() => setModalCreate(false)} onFinish={() => { setModalCreate(false); }} />
    </View>
  );
}

// ─── Sub-components (Agora aceitam cores dinâmicas) ──────────────────────────

function InfoRow({ icon, color, label, value, txtColor, subColor }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <View style={{
        backgroundColor: color + '22',
        width: 30, height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <View>
        <Text style={{ color: subColor, fontSize: 10, letterSpacing: 0.4 }}>{label}</Text>
        <Text style={{ color: txtColor, fontSize: 13, fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );
}

function MiniStat({ label, value, color, subColor, cardBg, borderCol }) {
  return (
    <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: borderCol }}>
      <Text style={{ color: subColor, fontSize: 10, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color, fontSize: 13, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function ActionBtn({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1,
        backgroundColor: color + '18',
        borderWidth: 1,
        borderColor: color + '44',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatusPill({ label, color, bg }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function StyledInput({ placeholder, value, onChangeText, txtColor, subColor, cardBg, borderCol }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={subColor}
      keyboardType="numeric"
      value={value}
      onChangeText={onChangeText}
      style={{
        backgroundColor: cardBg,
        color: txtColor,
        padding: 16,
        borderRadius: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: borderCol,
      }}
    />
  );
}
