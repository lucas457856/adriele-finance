import { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { subscribeContratos } from '../services/contracts';
import { subscribeClientes } from '../services/database';

// ─── Palette Fixa (Cores de Destaque) ───────────────────────────────────────
const ACCENT  = '#A78BFA';
const GREEN   = '#34D399';
const RED     = '#F87171';

export default function CobrancasHoje({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.dark;

  // ── Cores Dinâmicas (Baseadas no Tema do CustomDrawer) ────────────────────
  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? '#161B27' : '#FFFFFF';
  const border = isDark ? '#1E2330' : '#E2E6F0';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';

  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes]   = useState([]);
  const [busca, setBusca]         = useState('');
  const [aba, setAba]             = useState('hoje');

  useEffect(() => {
    const u1 = subscribeContratos(setContratos);
    const u2 = subscribeClientes(setClientes);
    return () => { u1(); u2(); };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getNome = (id) => clientes.find(x => x.id === id)?.nome ?? '…';
  const getTel  = (id) => clientes.find(x => x.id === id)?.telefone ?? null;

  const money = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const gerarParcelas = (c) => {
    const n = Number(c.parcelas) || 0;
    const d = Number(c.intervaloDias) || 0;
    if (!c.data) return [];
    const [dd, mm, yy] = c.data.split('/');
    let dt = new Date(yy, mm - 1, dd);
    return Array.from({ length: n }, (_, i) => {
      dt.setDate(dt.getDate() + d);
      return { numero: i + 1, vencimento: new Date(dt).toLocaleDateString('pt-BR') };
    });
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const listaCobranca = [];
  contratos.forEach(c => {
    gerarParcelas(c).forEach(p => {
      if (c.parcelasPagas?.includes(p.numero)) return;
      if (c.parcelasJurosPagos?.includes(p.numero)) return;
      const [dd, mm, yy] = p.vencimento.split('/');
      const dt = new Date(Number(yy), Number(mm) - 1, Number(dd));
      const isHoje    = dt.getTime() === hoje.getTime();
      const isVencida = dt < hoje;
      if ((aba === 'hoje' && isHoje) || (aba === 'vencidas' && isVencida)) {
        listaCobranca.push({ contrato: c, parcela: p });
      }
    });
  });

  const filtrados = listaCobranca.filter(item =>
    getNome(item.contrato.clienteId).toLowerCase().includes(busca.toLowerCase())
  );

  const enviarWhatsApp = (contrato, parcela) => {
    const nome     = getNome(contrato.clienteId);
    const telefone = getTel(contrato.clienteId);
    if (!telefone) { alert('Cliente sem telefone'); return; }
    const vParc    = Number(contrato.valorParcela) || 0;
    const numP     = `${parcela.numero}ª`;
    const item     = contrato.produto ? `(${contrato.produto})` : '';
    const desc     = `pedido ${item}da ${contrato.marca || 'loja'}`;

    // Lógica de introdução baseada na aba (Hoje ou Vencidas)
    const intro  = aba === 'hoje'
      ? `Olá, ${nome}! Tudo bem? ✨\n\nPassando para lembrar que a sua ${numP} parcela do seu ${desc} vence HOJE, dia ${parcela.vencimento}.`
      : `Olá, ${nome}! Tudo bem? ✨\n\nConstatamos que a sua ${numP} parcela do seu ${desc} venceu no dia ${parcela.vencimento} e ainda não identificamos o pagamento.`;

    const msg = `${intro}\n\n` +
      `💰 Valor: ${money(vParc)}\n\n` +
      `Formas de pagamentos: Cartão ou Dinheiro.\n` +
      `Se preferir outra opção só chamar! 😊\n\n` +
      `Segue os dados\n` +
      `🔑 Chave Pix: 85999288032\n` +
      `Adriana Goncalves dos Santos\n` +
      `🏦 Banco: Mercado Pago`;

    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };


  const abaColor = aba === 'hoje' ? GREEN : RED;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>

      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: border,
      }}>
        <View>
          <Text style={{ color: abaColor, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
            {aba === 'hoje' ? 'Vencem hoje' : 'Em atraso'}
          </Text>
          <Text style={{ color: txt, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
            Cobranças
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: card, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: border }}
        >
          <Ionicons name="close" size={20} color={sub} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>

        {/* ── Abas ── */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <AbaBtn
            label="Vencem Hoje"
            icon="time-outline"
            ativa={aba === 'hoje'}
            cor={GREEN}
            bg={card}
            border={border}
            txt={sub}
            onPress={() => setAba('hoje')}
          />
          <AbaBtn
            label="Vencidas"
            icon="alert-circle-outline"
            ativa={aba === 'vencidas'}
            cor={RED}
            bg={card}
            border={border}
            txt={sub}
            onPress={() => setAba('vencidas')}
          />
        </View>

        {/* ── Busca ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: card, borderRadius: 14, paddingHorizontal: 14,
          borderWidth: 1, borderColor: border,
        }}>
          <Ionicons name="search-outline" size={18} color={sub} />
          <TextInput
            placeholder="Buscar por cliente…"
            placeholderTextColor={sub}
            value={busca}
            onChangeText={setBusca}
            style={{ flex: 1, color: txt, paddingVertical: 13, fontSize: 14 }}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={18} color={sub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Lista ── */}
      <FlatList
        data={filtrados}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60, gap: 10 }}>
            <Ionicons name="checkmark-circle-outline" size={48} color={sub} />
            <Text style={{ color: sub, fontSize: 15 }}>
              {aba === 'hoje' ? 'Nenhuma cobrança para hoje' : 'Nenhuma parcela vencida'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const { contrato, parcela } = item;
          const nome  = getNome(contrato.clienteId);
          const total = Number(contrato.parcelasOriginais ?? contrato.parcelas) || 1;
          const valor = Number(contrato.valorParcela) || (Number(contrato.valor) / total);

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('ListContracts', { abrirContrato: contrato })}
              activeOpacity={0.75}
              style={{
                backgroundColor: card,
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: aba === 'vencidas' ? RED + '33' : border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: sub, fontSize: 11, letterSpacing: 0.4 }}>
                  Venda #{contrato.numeroContrato}  ·  Parcela {parcela.numero}
                </Text>
                <View style={{
                  backgroundColor: aba === 'vencidas' ? RED + '22' : GREEN + '22',
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
                }}>
                  <Text style={{ color: aba === 'vencidas' ? RED : GREEN, fontSize: 10, fontWeight: '600' }}>
                    {aba === 'vencidas' ? '⚠ Vencida' : '🕐 Hoje'}
                  </Text>
                </View>
              </View>

              <Text style={{ color: txt, fontWeight: '700', fontSize: 17, marginBottom: 2 }}>
                {nome}
              </Text>
              <Text style={{ color: sub, fontSize: 12, marginBottom: 12 }}>
                {contrato.marca}  ·  venc. {parcela.vencimento}
              </Text>

              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                borderTopWidth: 1, borderTopColor: border, paddingTop: 12,
              }}>
                <Text style={{ color: GREEN, fontWeight: '800', fontSize: 18 }}>
                  {money(valor)}
                </Text>

                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation(); enviarWhatsApp(contrato, parcela); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    backgroundColor: '#075E54',
                    paddingHorizontal: 14, paddingVertical: 9,
                    borderRadius: 12,
                  }}
                >
                  <FontAwesome name="whatsapp" size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                    Cobrar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function AbaBtn({ label, icon, ativa, cor, bg, border, txt, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: ativa ? cor + '22' : bg,
        borderWidth: 1,
        borderColor: ativa ? cor : border,
        paddingVertical: 12,
        borderRadius: 14,
      }}
    >
      <Ionicons name={icon} size={16} color={ativa ? cor : txt} />
      <Text style={{ color: ativa ? cor : txt, fontWeight: '700', fontSize: 13 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
