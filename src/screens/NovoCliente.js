import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addCliente } from '../services/database';

// ─── Palette ────────────────────────────────────────────────────────────────
const ACCENT = '#A78BFA';
const GREEN  = '#34D399';
const BG     = '#0F1219';
const CARD   = '#161B27';
const CARD2  = '#1C2235';
const BORDER = '#1E2330';
const TXT    = '#E8ECF4';
const SUB    = '#8892A4';
// ────────────────────────────────────────────────────────────────────────────

const CAMPOS = [
  { key: 'nome',     label: 'Nome',     placeholder: 'Nome completo',      icon: 'person-outline',   keyboard: 'default'       },
  { key: 'email',    label: 'E-mail',   placeholder: 'email@exemplo.com',  icon: 'mail-outline',     keyboard: 'email-address' },
  { key: 'telefone', label: 'Telefone', placeholder: '(00) 00000-0000',    icon: 'call-outline',     keyboard: 'phone-pad'     },
  { key: 'cpf',      label: 'CPF',      placeholder: '000.000.000-00',     icon: 'card-outline',     keyboard: 'numeric'       },
];

export default function NovoCliente({ navigation }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '' });
  const [focado, setFocado] = useState(null);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const salvar = async () => {
    const { nome, email, telefone, cpf } = form;
    if (!nome || !email || !telefone || !cpf) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para continuar.');
      return;
    }
    try {
      await addCliente(form);
      navigation.reset({ index: 0, routes: [{ name: 'Clientes' }] });
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    }
  };

  const preenchidos = Object.values(form).filter(Boolean).length;
  const progresso   = preenchidos / CAMPOS.length;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: BORDER,
      }}>
        <View>
          <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
            Cadastro
          </Text>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
            Novo Cliente
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Clientes')}
          style={{ backgroundColor: CARD, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: BORDER }}
        >
          <Ionicons name="close" size={20} color={SUB} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Progresso ── */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: SUB, fontSize: 12 }}>Campos preenchidos</Text>
            <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '600' }}>
              {preenchidos}/{CAMPOS.length}
            </Text>
          </View>
          <View style={{ height: 3, backgroundColor: BORDER, borderRadius: 4 }}>
            <View style={{
              height: 3, width: `${progresso * 100}%`,
              backgroundColor: progresso === 1 ? GREEN : ACCENT,
              borderRadius: 4,
            }} />
          </View>
        </View>

        {/* ── Campos ── */}
        {CAMPOS.map(({ key, label, placeholder, icon, keyboard }) => {
          const ativo = focado === key;
          return (
            <View key={key}>
              <Text style={{
                color: ativo ? ACCENT : SUB,
                fontSize: 11, letterSpacing: 0.5,
                textTransform: 'uppercase', marginBottom: 6,
              }}>
                {label}
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: CARD,
                borderRadius: 14,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: ativo ? ACCENT : BORDER,
              }}>
                <Ionicons name={icon} size={18} color={ativo ? ACCENT : SUB} />
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor={SUB}
                  value={form[key]}
                  onChangeText={(v) => set(key, v)}
                  keyboardType={keyboard}
                  autoCapitalize={key === 'nome' ? 'words' : 'none'}
                  onFocus={() => setFocado(key)}
                  onBlur={() => setFocado(null)}
                  style={{ flex: 1, color: TXT, paddingVertical: 14, fontSize: 14 }}
                />
                {form[key].length > 0 && (
                  <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                )}
              </View>
            </View>
          );
        })}

        {/* ── Botão ── */}
        <TouchableOpacity
          onPress={salvar}
          style={{
            backgroundColor: ACCENT,
            padding: 17,
            borderRadius: 16,
            alignItems: 'center',
            marginTop: 8,
            shadowColor: ACCENT,
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 }}>
            Salvar Cliente
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}