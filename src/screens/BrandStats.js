import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import DonutChart from '../components/DonutChart';
import { ThemeContext } from '../context/ThemeContext';
import { subscribeContratos } from '../services/contracts';

// ─── Palette Fixa ───────────────────────────────────────────────────────────
const ACCENT  = '#A78BFA';
const BLUE    = '#60A5FA';
const YELLOW  = '#FBBF24';
const ORANGE  = '#FB923C';
const GREEN   = '#34D399';
// ────────────────────────────────────────────────────────────────────────────

export default function BrandStats({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.dark;

  // Cores Dinâmicas
  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? '#161B27' : '#FFFFFF';
  const border = isDark ? '#1E2330' : '#E2E6F0';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeContratos((data) => {
      setContratos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔥 Lógica de Contagem por Marca
  const brandCounts = contratos.reduce((acc, c) => {
    const m = c.marca || 'Outros';
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  // Preparando dados para o Gráfico
  const brandsList = Object.entries(brandCounts).map(([nome, valor]) => {
    let cor = '#8892A4'; // default
    if (nome === 'Marva') cor = BLUE;
    if (nome === 'Isa Folheados') cor = YELLOW;
    if (nome === 'Neide Semijoias') cor = ORANGE;
    
    return { nome, valor, cor };
  });

  const totalVendas = contratos.length;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

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
          <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
            Análise
          </Text>
          <Text style={{ color: txt, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
            Estatísticas de Marcas
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: card, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: border }}
        >
          <Ionicons name="close" size={20} color={sub} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        
        {/* Card de Total Geral */}
        <View style={{
          backgroundColor: card,
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: border,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          <Text style={{ color: sub, fontSize: 14 }}>Total de Vendas Registradas</Text>
          <Text style={{ color: txt, fontSize: 42, fontWeight: '800' }}>{totalVendas}</Text>
        </View>

        {/* Card do Gráfico */}
        <View style={{
          backgroundColor: card,
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: border,
        }}>
          <Text style={{ color: txt, fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>
            Distribuição de Marcas
          </Text>
          
          <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <DonutChart data={brandsList} />
          </View>
        </View>

        {/* Lista Detalhada */}
        <Text style={{ color: txt, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
          Detalhamento
        </Text>

        {brandsList.sort((a, b) => b.valor - a.valor).map((item, index) => (
          <View key={item.nome} style={{
            backgroundColor: card,
            borderRadius: 18,
            padding: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.cor }} />
              <Text style={{ color: txt, fontSize: 15, fontWeight: '600' }}>{item.nome}</Text>
            </View>
            <View style={{ 
              backgroundColor: item.cor + '22', 
              paddingHorizontal: 12, 
              paddingVertical: 4, 
              borderRadius: 12,
              borderWidth: 1,
              borderColor: item.cor + '44'
            }}>
              <Text style={{ color: item.cor, fontWeight: '800', fontSize: 14 }}>
                {item.valor} vendas
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
