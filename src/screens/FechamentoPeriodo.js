import { useContext, useEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemeContext } from '../context/ThemeContext';
import { subscribeContratos } from '../services/contracts';
import { subscribeClientes } from '../services/database';

// ─── Palette Fixa (SÓ cores de destaque) ───────────────────────────────────
const ACCENT = '#A78BFA';
const GREEN  = '#34D399';
const RED    = '#F87171';
const BLUE   = '#60A5FA';
// ────────────────────────────────────────────────────────────────────────────

export default function FechamentoPeriodo({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.dark;

  // ── Cores Dinâmicas (Sincronizadas com o CustomDrawer) ────────────────────
  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? '#161B27' : '#FFFFFF';
  const card2  = isDark ? '#1C2235' : '#F9FAFB';
  const border = isDark ? '#1E2330' : '#E2E6F0';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';

  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes]   = useState([]);

  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim]       = useState(new Date());
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim]       = useState(false);

  useEffect(() => {
    const u1 = subscribeClientes((d) => setClientes(Array.isArray(d) ? d : []));
    const u2 = subscribeContratos((d) => setContratos(Array.isArray(d) ? d : []));
    return () => { u1?.(); u2?.(); };
  }, []);

  const clientesMap = useMemo(() => {
    const m = {};
    clientes.forEach(c => { m[c.id] = c; });
    return m;
  }, [clientes]);

  const fmt = (date) => date.toLocaleDateString('pt-BR');

  const parseDate = (s) => {
    if (!s) return null;
    const [d, m, y] = s.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const money = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ── Filtro ────────────────────────────────────────────────────────────────
  const inicio = new Date(dataInicio); inicio.setHours(0, 0, 0, 0);
  const fim    = new Date(dataFim);    fim.setHours(23, 59, 59, 999);

  const contratosFiltrados = contratos.filter(item => {
    const d = parseDate(item.data);
    if (!d) return false;
    return d.getTime() >= inicio.getTime() && d.getTime() <= fim.getTime();
  });

  const dados = contratosFiltrados.map((item) => ({
    id:       item.id,
    nome:     clientesMap[item.clienteId]?.nome || 'Sem nome',
    contrato: item.numeroContrato || '—',
    recebido: Number(item.valor        || 0),
    desconto: Number(item.lucro        || 0),
    total:    Number(item.totalReceber || 0),
  }));

  const totalValor    = dados.reduce((a, i) => a + i.recebido, 0);
  const totalDesconto = dados.reduce((a, i) => a + i.desconto, 0);
  const totalFinal    = dados.reduce((a, i) => a + i.total,    0);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>

      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: border,
      }}>
        <View>
          <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
            Relatório
          </Text>
          <Text style={{ color: txt, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
            Fechamento
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: card, borderRadius: 12, padding: 9, borderWidth: 1, borderColor: border }}
        >
          <Ionicons name="close" size={20} color={sub} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Seletor de período ── */}
        <View style={{
          backgroundColor: card, borderRadius: 20, padding: 16,
          borderWidth: 1, borderColor: border,
        }}>
          <Text style={{ color: sub, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Período
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <DateBtn label="De" value={fmt(dataInicio)} onPress={() => setShowInicio(true)} txt={txt} sub={sub} card={card2} border={border} />
            <DateBtn label="Até" value={fmt(dataFim)}   onPress={() => setShowFim(true)}    txt={txt} sub={sub} card={card2} border={border} />
          </View>
        </View>

        {/* ── Calendários ── */}
        {showInicio && (
          <DateTimePicker
            value={dataInicio} mode="date" display="default"
            onChange={(e, d) => { setShowInicio(Platform.OS === 'ios'); if (d) setDataInicio(d); }}
          />
        )}
        {showFim && (
          <DateTimePicker
            value={dataFim} mode="date" display="default"
            onChange={(e, d) => { setShowFim(Platform.OS === 'ios'); if (d) setDataFim(d); }}
          />
        )}

        {/* ── Resumo do período ── */}
        <View style={{
          backgroundColor: card, borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: border, overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            backgroundColor: ACCENT, borderTopLeftRadius: 20, borderTopRightRadius: 20,
          }} />

          <Text style={{ color: txt, fontSize: 15, fontWeight: '700', marginBottom: 16 }}>
            Resumo do período
          </Text>

          <View style={{ gap: 10 }}>
            <ResumoRow icon="cash-outline"          color={GREEN}  label="Total vendido"    value={money(totalValor)} sub={sub} />
            <ResumoRow icon="trending-down-outline" color={RED}    label="Despesas"         value={money(totalDesconto)} sub={sub} />
            <ResumoRow icon="wallet-outline"        color={BLUE}   label="Multa"            value={money(0)}             sub={sub} />
            <View style={{ height: 1, backgroundColor: border }} />
            <ResumoRow icon="receipt-outline"       color={ACCENT} label="Total a receber"  value={money(totalFinal)}    bold sub={sub} />
            <ResumoRow icon="sparkles-outline"      color={GREEN}  label="Lucro estimado"   value={money(totalDesconto)} bold sub={sub} />
          </View>
        </View>

        {/* ── Contador ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ backgroundColor: ACCENT + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '700' }}>
              {dados.length} {dados.length === 1 ? 'contrato' : 'contratos'}
            </Text>
          </View>
          <Text style={{ color: sub, fontSize: 12 }}>no período selecionado</Text>
        </View>

        {/* ── Lista ── */}
        {dados.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, gap: 10 }}>
            <Ionicons name="document-outline" size={48} color={sub} />
            <Text style={{ color: sub, fontSize: 15 }}>Nenhum contrato no período</Text>
          </View>
        ) : (
          dados.map(item => (
            <View key={item.id} style={{
              backgroundColor: card, borderRadius: 18, padding: 16,
              borderWidth: 1, borderColor: border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: txt, fontWeight: '700', fontSize: 15, flex: 1 }}>
                  {item.nome}
                </Text>
                <Text style={{ color: sub, fontSize: 11 }}>#{item.contrato}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <MiniStat label="Vendido"    value={money(item.recebido)} color={GREEN}  cardBg={card2} borderCol={border} sub={sub} />
                <MiniStat label="Desconto"   value={money(item.desconto)} color={RED}    cardBg={card2} borderCol={border} sub={sub} />
                <MiniStat label="A Receber"  value={money(item.total)}    color={ACCENT} cardBg={card2} borderCol={border} sub={sub} />
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

// ─── Sub-components (Com cores dinâmicas) ──────────────────────────────────

function DateBtn({ label, value, onPress, txt, sub, card, border }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1, backgroundColor: card,
        borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: border,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <View>
        <Text style={{ color: sub, fontSize: 10, marginBottom: 2 }}>{label}</Text>
        <Text style={{ color: txt, fontSize: 13, fontWeight: '600' }}>{value}</Text>
      </View>
      <Ionicons name="calendar-outline" size={18} color={ACCENT} />
    </TouchableOpacity>
  );
}

function ResumoRow({ icon, color, label, value, bold, sub }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ backgroundColor: color + '22', width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={{ color: sub, fontSize: 13 }}>{label}</Text>
      </View>
      <Text style={{ color, fontSize: 14, fontWeight: bold ? '800' : '600' }}>{value}</Text>
    </View>
  );
}

function MiniStat({ label, value, color, cardBg, borderCol, sub }) {
  return (
    <View style={{ flex: 1, backgroundColor: cardBg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: borderCol }}>
      <Text style={{ color: sub, fontSize: 10, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color, fontSize: 12, fontWeight: '700' }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}
