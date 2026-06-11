import { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 🔥 CORRIGIDO AQUI
import { ThemeContext } from '../context/ThemeContext';
import {
  addCliente,
  deleteCliente,
  getClientes,
  updateCliente,
} from '../services/database';

// ─── Palette Fixa (Cores de Destaque) ───────────────────────────────────────
const ACCENT = '#A78BFA';
const GREEN  = '#34D399';
const RED    = '#F87171';
// ────────────────────────────────────────────────────────────────────────────

export default function Clientes({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.dark;

  // ── Cores Dinâmicas (Sincronizadas com o CustomDrawer) ────────────────────
  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? '#161B27' : '#FFFFFF';
  const card2  = isDark ? '#1C2235' : '#F9FAFB';
  const border = isDark ? '#1E2330' : '#E2E6F0';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';

  const insets = useSafeAreaInsets();

  const [clientes, setClientes]                 = useState([]);
  const [busca, setBusca]                       = useState('');
  const [modalVisible, setModalVisible]         = useState(false);
  const [modalExcluir, setModalExcluir]         = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [focado, setFocado]                     = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '' });

  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const load = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (e) {
      console.log('❌ ERRO:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const novoCliente = () => {
    setClienteSelecionado(null);
    setForm({ nome: '', email: '', telefone: '', cpf: '' });
    setModalVisible(true);
  };

  const abrirModal = (cliente) => {
    setClienteSelecionado(cliente);
    setForm({
      nome:     cliente.nome     || '',
      email:    cliente.email    || '',
      telefone: cliente.telefone || '',
      cpf:      cliente.cpf      || '',
    });
    setModalVisible(true);
  };

  const salvar = async () => {
    try {
      if (clienteSelecionado) {
        await updateCliente(clienteSelecionado.id, form);
      } else {
        await addCliente(form);
      }
      setModalVisible(false);
      load();
    } catch (e) {
      console.log('❌ ERRO SALVAR:', e);
    }
  };

  const excluir = async (id) => {
    try {
      await deleteCliente(id);
      setModalVisible(false);
      setModalExcluir(false);
      load();
    } catch (e) {
      console.log('❌ ERRO DELETE:', e);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone?.includes(busca)
  );

  const iniciais = (nome) =>
    nome?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';

  const CAMPOS_MODAL = [
    { key: 'nome',     label: 'Nome',      placeholder: 'Nome completo',     icon: 'person-outline',  keyboard: 'default'   },
    { key: 'telefone', label: 'Telefone',  placeholder: '(00) 00000-0000',   icon: 'call-outline',    keyboard: 'phone-pad' },
    { key: 'cpf',      label: 'CPF',       placeholder: '000.000.000-00',    icon: 'card-outline',    keyboard: 'numeric'   },
    { key: 'email',    label: 'Endereço',  placeholder: 'Rua, número, bairro', icon: 'location-outline', keyboard: 'default' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>

      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: border,
      }}>
        <View>
          <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
            Cadastro
          </Text>
          <Text style={{ color: txt, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
            Clientes
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={novoCliente}
            style={{
              backgroundColor: ACCENT,
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Novo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            style={{ backgroundColor: card, borderRadius: 12, padding: 9, borderWidth: 1, borderColor: border }}
          >
            <Ionicons name="close" size={20} color={sub} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>

        {/* ── KPI Card ── */}
        <View style={{
          backgroundColor: card, borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: border, overflow: 'hidden',
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            backgroundColor: ACCENT, borderTopLeftRadius: 20, borderTopRightRadius: 20,
          }} />
          <View>
            <Text style={{ color: sub, fontSize: 12, marginBottom: 4 }}>Total de Clientes</Text>
            <Text style={{ color: txt, fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>
              {clientes.length}
            </Text>
          </View>
          <View style={{
            backgroundColor: ACCENT + '22', width: 52, height: 52,
            borderRadius: 26, justifyContent: 'center', alignItems: 'center',
          }}>
            <Ionicons name="people-outline" size={26} color={ACCENT} />
          </View>
        </View>

        {/* ── Busca ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: card, borderRadius: 14, paddingHorizontal: 14,
          borderWidth: 1, borderColor: border,
        }}>
          <Ionicons name="search-outline" size={18} color={sub} />
          <TextInput
            placeholder="Buscar por nome ou telefone…"
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
        data={clientesFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60, gap: 10 }}>
            <Ionicons name="people-outline" size={48} color={sub} />
            <Text style={{ color: sub, fontSize: 15 }}>Nenhum cliente encontrado</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => abrirModal(item)}
            activeOpacity={0.75}
            style={{
              backgroundColor: card, borderRadius: 18, padding: 16,
              borderWidth: 1, borderColor: border,
              flexDirection: 'row', alignItems: 'center', gap: 14,
            }}
          >
            <View style={{
              backgroundColor: ACCENT + '22', width: 44, height: 44,
              borderRadius: 22, justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ color: ACCENT, fontWeight: '700', fontSize: 15 }}>
                {iniciais(item.nome)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: txt, fontWeight: '700', fontSize: 15, marginBottom: 2 }}>
                {item.nome}
              </Text>
              <Text style={{ color: sub, fontSize: 12 }}>{item.telefone}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={sub} />
          </TouchableOpacity>
        )}
      />

      {/* ════════ MODAL NOVO/EDITAR ════════ */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
          justifyContent: 'center', padding: 20,
        }}>
          <View style={{
            backgroundColor: card, borderRadius: 24, padding: 24,
            borderWidth: 1, borderColor: border,
          }}>

            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <View>
                <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>
                  {clienteSelecionado ? 'Editar' : 'Novo'}
                </Text>
                <Text style={{ color: txt, fontSize: 18, fontWeight: '700' }}>
                  {clienteSelecionado ? clienteSelecionado.nome : 'Novo Cliente'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ backgroundColor: card2, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: border }}
              >
                <Ionicons name="close" size={20} color={sub} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {CAMPOS_MODAL.map(({ key, label, placeholder, icon, keyboard }) => {
                const ativo = focado === key;
                return (
                  <View key={key}>
                    <Text style={{
                      color: ativo ? ACCENT : sub,
                      fontSize: 11, letterSpacing: 0.5,
                      textTransform: 'uppercase', marginBottom: 6,
                    }}>
                      {label}
                    </Text>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                      backgroundColor: card2, borderRadius: 12, paddingHorizontal: 12,
                      borderWidth: 1, borderColor: ativo ? ACCENT : border,
                    }}>
                      <Ionicons name={icon} size={16} color={ativo ? ACCENT : sub} />
                      <TextInput
                        value={form[key]}
                        onChangeText={(v) => setF(key, v)}
                        placeholder={placeholder}
                        placeholderTextColor={sub}
                        keyboardType={keyboard}
                        autoCapitalize={key === 'nome' ? 'words' : 'none'}
                        onFocus={() => setFocado(key)}
                        onBlur={() => setFocado(null)}
                        style={{ flex: 1, color: txt, paddingVertical: 12, fontSize: 14 }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={salvar}
                style={{
                  flex: 1, backgroundColor: ACCENT,
                  padding: 15, borderRadius: 14, alignItems: 'center',
                  elevation: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Salvar</Text>
              </TouchableOpacity>

              {clienteSelecionado && (
                <TouchableOpacity
                  onPress={() => { setModalVisible(false); setModalExcluir(true); }}
                  style={{
                    backgroundColor: RED + '22', borderWidth: 1, borderColor: RED + '55',
                    padding: 15, borderRadius: 14, alignItems: 'center', paddingHorizontal: 20,
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={RED} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ════════ MODAL EXCLUIR ════════ */}
      <Modal visible={modalExcluir} transparent animationType="fade">
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
          justifyContent: 'center', padding: 24,
        }}>
          <View style={{
            backgroundColor: card, borderRadius: 24, padding: 24,
            borderWidth: 1, borderColor: border,
          }}>
            <Text style={{ color: txt, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              Excluir cliente?
            </Text>
            <Text style={{ color: sub, fontSize: 13, marginBottom: 24 }}>
              {clienteSelecionado?.nome} será removido permanentemente.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setModalExcluir(false)}
                style={{
                  flex: 1, backgroundColor: card2, padding: 14,
                  borderRadius: 12, alignItems: 'center',
                  borderWidth: 1, borderColor: border,
                }}
              >
                <Text style={{ color: sub, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => excluir(clienteSelecionado?.id)}
                style={{ flex: 1, backgroundColor: RED, padding: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
