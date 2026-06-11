import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../context/ThemeContext';

// ─── Palette (mesma da Dashboard) ───────────────────────────────────────────
const ACCENT  = '#A78BFA';
const GREEN   = '#34D399';
const DIVIDER = '#1E2330';
const SURFACE = '#161B27';
// ────────────────────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { label: 'Dashboard',      icon: 'home-outline',       screen: 'Dashboard'        },
  { label: 'Lista de Vendas',icon: 'document-text-outline', screen: 'ListContracts' },
  { label: 'Clientes',       icon: 'people-outline',     screen: 'Clientes'         },
  { label: 'Cobranças Hoje', icon: 'cash-outline',       screen: 'CobrancasHoje'    },
  { label: 'Fechamento',     icon: 'time-outline',       screen: 'FechamentoPeriodo'},
  { label: 'Estatísticas de Marcas',     icon: 'time-outline',       screen: 'BrandStats'},
];

export default function CustomDrawer({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const isDark = theme.dark;
  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? SURFACE   : '#FFFFFF';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';
  const border = isDark ? DIVIDER   : '#E2E6F0';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16 + insets.top,
        paddingBottom: 20 + insets.bottom,
        justifyContent: 'space-between',
      }}>

        {/* ── Topo ── */}
        <View>
          {/* Branding */}
          <View style={{
            backgroundColor: card,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: border,
            marginBottom: 28,
            overflow: 'hidden',
          }}>
            {/* faixa decorativa (igual ao card "Total vendido") */}
            <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 3,
              backgroundColor: ACCENT,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }} />

            <Text style={{ color: txt, fontSize: 36, fontWeight: '800', letterSpacing: -0.5 }}>
              Adriele
            </Text>
            <Text style={{ color: ACCENT, fontSize: 15, fontWeight: '600', marginTop: -2 }}>
              Finance
            </Text>
            <Text style={{ color: sub, fontSize: 12, marginTop: 8, letterSpacing: 0.3 }}>
              Gestão avançada do seu capital
            </Text>

            {/* Badge versão */}
            <View style={{
              alignSelf: 'flex-start',
              backgroundColor: ACCENT + '22',
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
              marginTop: 12,
            }}>
              <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '600' }}>
                v 1.5.0
              </Text>
            </View>
          </View>

          {/* ── Menu ── */}
          <View style={{
            backgroundColor: card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: border,
            overflow: 'hidden',
          }}>
            {MENU_ITEMS.map((item, index) => (
              <View key={item.screen}>
                <TouchableOpacity
                  onPress={() => navigation.navigate(item.screen)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    gap: 12,
                  }}
                  activeOpacity={0.7}
                >
                  {/* ícone com fundo tintado */}
                  <View style={{
                    backgroundColor: ACCENT + '22',
                    width: 34, height: 34,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Ionicons name={item.icon} size={18} color={ACCENT} />
                  </View>

                  <Text style={{ color: txt, fontSize: 15, fontWeight: '500', flex: 1 }}>
                    {item.label}
                  </Text>

                  <Ionicons name="chevron-forward" size={16} color={sub} />
                </TouchableOpacity>

                {index < MENU_ITEMS.length - 1 && (
                  <View style={{ height: 1, backgroundColor: border, marginLeft: 16 }} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── Switch de tema ── */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            backgroundColor: card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            paddingHorizontal: 18,
          }}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              backgroundColor: GREEN + '22',
              width: 32, height: 32,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={17}
                color={GREEN}
              />
            </View>
            <Text style={{ color: txt, fontSize: 14, fontWeight: '500' }}>
              {isDark ? 'Modo Claro' : 'Modo Escuro'}
            </Text>
          </View>

          {/* toggle pill */}
          <View style={{
            width: 44, height: 24,
            borderRadius: 12,
            backgroundColor: isDark ? ACCENT : border,
            justifyContent: 'center',
            paddingHorizontal: 3,
            alignItems: isDark ? 'flex-end' : 'flex-start',
          }}>
            <View style={{
              width: 18, height: 18,
              borderRadius: 9,
              backgroundColor: '#fff',
            }} />
          </View>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}