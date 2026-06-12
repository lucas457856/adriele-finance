import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DonutChart from '../components/DonutChart';

import { useFocusEffect } from '@react-navigation/native';

import ContractModal from '../components/ContractModal';
import { ThemeContext } from '../context/ThemeContext';
import { getContratos } from '../services/contracts';

// ─── Palette ────────────────────────────────────────────────────────────────
const ACCENT   = '#A78BFA'; // violeta suave
const GREEN    = '#34D399'; // esmeralda
const BLUE     = '#60A5FA';
const YELLOW   = '#FBBF24';
const PURPLE   = '#C084FC';
const DIVIDER  = '#1E2330';
const SURFACE  = '#161B27';
// ────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ navigation }) {
  const [contratos, setContratos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const isDark = theme.dark;
  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? SURFACE   : '#FFFFFF';
  // const card2  = isDark ? SURFACE2  : '#F7F8FC';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';
  const border = isDark ? DIVIDER   : '#E2E6F0';

  // ── Data loading ────────────────────────────────────────────────────────
  const load = async () => {
    try {
      setLoading(true);
      const data = await getContratos();
      setContratos(Array.isArray(data) ? data : []);
    } catch {
      setContratos([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  // ── Helpers ─────────────────────────────────────────────────────────────
  const money = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const parseDate = (s) => {
    const [d, m, y] = s.split('/');
    return new Date(`${y}-${m}-${d}`);
  };

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalContratos = contratos.length;

  const totalInvestido = contratos.reduce((acc, item) => {
    const v  = Number(item.valor || 0);
    const vt = Number(item.valorTotal ?? (v + Number(item.lucro || 0)));
    const r  = Number(item.totalReceber ?? vt);
    return acc + v * (r / vt);
  }, 0);

  const totalReceber = contratos.reduce(
    (acc, item) => acc + Number(item.totalReceber || 0), 0
  );

  // ── Marcas ───────────────────────────────────────────────────────────────
  const sum = (marca) =>
    contratos.filter(c => c.marca === marca)
             .reduce((s, c) => s + Number(c.valor || 0), 0);

  const marcasData = [
    { nome: 'Marva',          valor: sum('Marva'),          cor: BLUE   },
    { nome: 'Isa Folheados',  valor: sum('Isa Folheados'),  cor: YELLOW },
    { nome: 'Neide Semijoias',valor: sum('Neide Semijoias'),cor: PURPLE },
  ];
  const marcaMaisVendida =
    [...marcasData].sort((a, b) => b.valor - a.valor)[0]?.nome || '—';

  // ── Monthly bars ─────────────────────────────────────────────────────────
  const nomesMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const contratosValidos = contratos
    .filter(c => c.data)
    .map(c => ({ ...c, dataObj: parseDate(c.data) }))
    .sort((a, b) => a.dataObj - b.dataObj);

  const mesInicial = contratosValidos[0]?.dataObj.getMonth() ?? new Date().getMonth();

  const mesesSelecionados = Array.from({ length: 6 }, (_, i) =>
    nomesMeses[(mesInicial + i) % 12]
  );

  const mesesMap = Object.fromEntries(mesesSelecionados.map(m => [m, 0]));
  contratosValidos.forEach(item => {
    const m = nomesMeses[item.dataObj.getMonth()];
    if (m in mesesMap) mesesMap[m] += Number(item.valor || 0);
  });

  const meses = mesesSelecionados.map(n => ({ nome: n, valor: mesesMap[n] }));
  const maxMes = Math.max(...meses.map(m => m.valor), 1);

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={ACCENT} />
      <Text style={{ color: sub, marginTop: 12, fontSize: 13, letterSpacing: 0.5 }}>
        Carregando dados…
      </Text>
    </SafeAreaView>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>

      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
      }}>
        <View>
          <Text style={{ color: sub, fontSize: 13, letterSpacing: 0.4 }}>
            Bem-vinda de volta,
          </Text>
          <Text style={{ color: txt, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
            Adriele ✦
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{
            backgroundColor: card,
            borderRadius: 12,
            padding: 9,
            borderWidth: 1,
            borderColor: border,
          }}
        >
          <Ionicons name="menu" size={22} color={txt} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[GREEN]}
            tintColor={GREEN}
          />
        }
      >

        {/* ── KPI row ── */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <KpiCard
            label="Vendas"
            value={String(totalContratos)}
            icon="receipt-outline"
            accent={ACCENT}
            card={card}
            border={border}
            txt={txt}
            sub={sub}
          />
          <KpiCard
            label="A Receber"
            value={money(totalReceber)}
            icon="wallet-outline"
            accent={GREEN}
            card={card}
            border={border}
            txt={txt}
            sub={sub}
          />
        </View>

        {/* ── Total vendido (destaque) ── */}
        <View style={{
          backgroundColor: card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: border,
          overflow: 'hidden',
        }}>
          {/* faixa decorativa */}
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 3,
            backgroundColor: ACCENT,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }} />
          <Text style={{ color: sub, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>
            Total vendido
          </Text>
          <Text style={{ color: txt, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
            {money(totalInvestido)}
          </Text>
          <Text style={{ color: sub, fontSize: 12, marginTop: 4 }}>
            em {totalContratos} {totalContratos === 1 ? 'contrato' : 'contratos'} ativos
          </Text>
        </View>

        {/* ── Vendas por marca ── */}
        <View style={{
          backgroundColor: card,
          borderRadius: 20,
          padding: 20,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: border,
        }}>
          <Row>
            <Text style={{ color: txt, fontSize: 15, fontWeight: '700' }}>
              Vendas por Marca
            </Text>
            <View style={{
              backgroundColor: isDark ? '#1E2A1E' : '#ECFDF5',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}>
              <Text style={{ color: GREEN, fontSize: 11, fontWeight: '600' }}>
                🏆 {marcaMaisVendida}
              </Text>
            </View>
          </Row>

          <View style={{ height: 1, backgroundColor: border, marginVertical: 14 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {/* Legend */}
            <View style={{ flex: 1.1, gap: 10 }}>
              {marcasData.map(item => (
                <View key={item.nome} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.cor }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: sub, fontSize: 11 }}>{item.nome}</Text>
                    <Text style={{ color: txt, fontSize: 13, fontWeight: '600' }}>
                      {money(item.valor)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            {/* Chart */}
            <View style={{ flex: 0.9, alignItems: 'center' }}>
              <DonutChart data={marcasData} />
            </View>
          </View>
        </View>

        {/* ── Vendas por mês ── */}
        <View style={{
          backgroundColor: card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: border,
        }}>
          <Text style={{ color: txt, fontSize: 15, fontWeight: '700', marginBottom: 20 }}>
            Vendas por Mês
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 6 }}>
            {meses.map((item, i) => {
              const h    = Math.max((item.valor / maxMes) * 120, 4);
              const isTop = item.valor === maxMes && item.valor > 0;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => navigation.navigate('ListContracts', { mes: item.nome })}
                  style={{ flex: 1, alignItems: 'center' }}
                  activeOpacity={0.7}
                >
                  {/* valor acima da barra */}
                  {item.valor > 0 && (
                    <Text style={{
                      color: isTop ? ACCENT : sub,
                      fontSize: 9,
                      marginBottom: 4,
                      fontWeight: isTop ? '700' : '400',
                    }}>
                      {(item.valor / 1000).toFixed(0)}k
                    </Text>
                  )}

                  <View style={{
                    width: '75%',
                    height: h,
                    borderRadius: 6,
                    backgroundColor: isTop ? ACCENT : (isDark ? '#2A3045' : '#E8EBF5'),
                    // faixa de destaque no topo
                    overflow: 'hidden',
                  }}>
                    {isTop && (
                      <View style={{ height: 3, backgroundColor: '#C4B5FD', borderRadius: 6 }} />
                    )}
                  </View>

                  <Text style={{
                    color: isTop ? ACCENT : sub,
                    fontSize: 11,
                    marginTop: 6,
                    fontWeight: isTop ? '700' : '400',
                  }}>
                    {item.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom nav ── */}
      <View style={{
        height: 64 + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: card,
        borderTopWidth: 1,
        borderTopColor: border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
      }}>
        <NavBtn icon="home"   onPress={() => navigation.navigate('Dashboard')}      color={ACCENT} />
        <NavBtn icon="people" onPress={() => navigation.navigate('Clientes')}       color={txt} />

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: ACCENT,
            width: 52, height: 52,
            borderRadius: 26,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: ACCENT,
            shadowOpacity: 0.45,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
            marginTop: -20,
          }}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>

        <NavBtn icon="cash"  onPress={() => navigation.navigate('CobrancasHoje')}      color={txt} />
        <NavBtn icon="time"  onPress={() => navigation.navigate('FechamentoPeriodo')}   color={txt} />
      </View>

      <ContractModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onFinish={load}
      />
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, accent, card, border, txt, sub }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: border,
      gap: 8,
    }}>
      <View style={{
        backgroundColor: accent + '22',
        width: 34, height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={{ color: sub, fontSize: 11, letterSpacing: 0.4 }}>{label}</Text>
      <Text style={{ color: txt, fontSize: 16, fontWeight: '700' }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function Row({ children }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      {children}
    </View>
  );
}

function NavBtn({ icon, onPress, color }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 6 }}>
      <Ionicons name={icon} size={24} color={color} />
    </TouchableOpacity>
  );
}