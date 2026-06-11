import { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';

import { addContrato } from '../services/contracts';
import { getClientes } from '../services/database';

// ─── Palette (mesma do Dashboard) ───────────────────────────────────────────
const ACCENT  = '#A78BFA';
const GREEN   = '#34D399';
const BLUE    = '#60A5FA';
const YELLOW  = '#FBBF24';
const PURPLE  = '#C084FC';
const BG      = '#0F1219';
const CARD    = '#161B27';
const CARD2   = '#1C2235';
const BORDER  = '#1E2330';
const TXT     = '#E8ECF4';
const SUB     = '#8892A4';

const MARCAS = [
  { label: 'Marva',          cor: BLUE   },
  { label: 'Isa Folheados',  cor: YELLOW },
  { label: 'Neide Semijoias',cor: PURPLE },
];

const TIPOS = ['ANEL', 'BRINCO', 'COLAR', 'CONJUNTO', 'PULSEIRA', 'ACESSÓRIOS'];
// ────────────────────────────────────────────────────────────────────────────

export default function ContractModal({ visible, onClose, onFinish }) {
  const [step, setStep]                 = useState(1);
  const [clientes, setClientes]         = useState([]);
  const [cliente, setCliente]           = useState(null);
  const [numeroVenda, setNumeroVenda]   = useState(null);
  const [busca, setBusca]               = useState('');

  const [tipo, setTipo]                 = useState('ANEL');
  const [marca, setMarca]               = useState('Marva');
  const [valor, setValor]               = useState('');
  const [entrada, setEntrada]           = useState('');
  const [parcelas, setParcelas]         = useState('');
  const [intervaloDias, setIntervaloDias] = useState('');
  const [dataInicio, setDataInicio]     = useState('');
  const [produto, setProduto]           = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) { limpar(); loadClientes(); }
  }, [visible]);

  const limpar = () => {
    setStep(1); setCliente(null); setBusca('');
    setTipo('ANEL'); setMarca('Marva');
    setValor(''); setEntrada(''); setParcelas('');
    setIntervaloDias(''); setDataInicio(''); setProduto('');
    setNumeroVenda(Math.floor(1000 + Math.random() * 9000));
  };

  const loadClientes = async () => {
    const data = await getClientes();
    setClientes(Array.isArray(data) ? data : []);
  };

  const fechar = () => { limpar(); onClose?.(); };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      setDataInicio(`${d}/${m}/${selectedDate.getFullYear()}`);
    }
  };

  const valorTotal     = Number(valor) || 0;
  const valorEntrada   = Number(entrada) || 0;
  const faltaReceber   = Math.max(valorTotal - valorEntrada, 0);
  const qtdParcelas    = Number(parcelas) || 0;
  const valorParcela   = qtdParcelas > 0 ? faltaReceber / qtdParcelas : 0;

  const money = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const criarVenda = async () => {
    if (!cliente) return;
    if (!dataInicio) { alert('Informe a data de início'); return; }
    await addContrato({
      tipo, numeroContrato: numeroVenda, data: dataInicio,
      clienteId: cliente.id, marca,
      valor: valorTotal, entrada: valorEntrada,
      parcelas: qtdParcelas, parcelasOriginais: qtdParcelas,
      intervaloDias: Number(intervaloDias) || 30,
      parcelasPagas: [], totalReceber: faltaReceber,
      valorParcela, produto,
    });
    onFinish?.(); fechar();
  };

  return (
    <Modal
      isVisible={visible}
      style={{ margin: 0 }}
      backdropOpacity={0.6}
      onBackdropPress={fechar}
      onBackButtonPress={fechar}
    >
      <View style={{ flex: 1, backgroundColor: BG }}>

        {/* ══ STEP 1 — Escolher cliente ════════════════════════════════════ */}
        {step === 1 && (
          <View style={{ flex: 1 }}>

            {/* Header */}
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
              borderBottomWidth: 1, borderBottomColor: BORDER,
            }}>
              <View>
                <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
                  Nova Venda
                </Text>
                <Text style={{ color: TXT, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
                  Escolher Cliente
                </Text>
              </View>
              <TouchableOpacity
                onPress={fechar}
                style={{ backgroundColor: CARD, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: BORDER }}
              >
                <Ionicons name="close" size={20} color={SUB} />
              </TouchableOpacity>
            </View>

            {/* Busca */}
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: CARD, borderRadius: 14, paddingHorizontal: 14,
                borderWidth: 1, borderColor: BORDER,
              }}>
                <Ionicons name="search-outline" size={18} color={SUB} />
                <TextInput
                  placeholder="Buscar cliente…"
                  placeholderTextColor={SUB}
                  value={busca}
                  onChangeText={setBusca}
                  style={{ flex: 1, color: TXT, paddingVertical: 13, fontSize: 14 }}
                />
              </View>
            </View>

            <FlatList
              data={clientesFiltrados}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setCliente(item); setStep(2); }}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: CARD, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
                    borderWidth: 1, borderColor: BORDER,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      backgroundColor: ACCENT + '22', width: 38, height: 38,
                      borderRadius: 19, justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ color: ACCENT, fontWeight: '700', fontSize: 15 }}>
                        {item.nome?.[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                    <Text style={{ color: TXT, fontSize: 15, fontWeight: '500' }}>{item.nome}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={SUB} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* ══ STEP 2 — Formulário ══════════════════════════════════════════ */}
        {step === 2 && (
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 40, marginBottom: 20,
            }}>
              <View>
                <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
                  Venda #{numeroVenda}
                </Text>
                <Text style={{ color: TXT, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
                  Nova Venda
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={{ backgroundColor: CARD, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: BORDER }}
                >
                  <Ionicons name="arrow-back" size={20} color={SUB} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={fechar}
                  style={{ backgroundColor: CARD, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: BORDER }}
                >
                  <Ionicons name="close" size={20} color={SUB} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Cliente (readonly) */}
            <FormLabel>Cliente</FormLabel>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: CARD2, borderRadius: 14, padding: 14,
              borderWidth: 1, borderColor: BORDER, marginBottom: 16,
            }}>
              <View style={{
                backgroundColor: ACCENT + '22', width: 34, height: 34,
                borderRadius: 17, justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ color: ACCENT, fontWeight: '700' }}>
                  {cliente?.nome?.[0]?.toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: TXT, fontSize: 15, fontWeight: '500' }}>{cliente?.nome}</Text>
            </View>

            {/* Data */}
            <FormLabel>Data da Venda</FormLabel>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TextInput
                placeholder="DD/MM/AAAA"
                placeholderTextColor={SUB}
                value={dataInicio}
                onChangeText={setDataInicio}
                style={{
                  flex: 1, backgroundColor: CARD, color: TXT,
                  padding: 14, borderRadius: 14, fontSize: 14,
                  borderWidth: 1, borderColor: BORDER,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: CARD, borderRadius: 14, paddingHorizontal: 14,
                  justifyContent: 'center', borderWidth: 1, borderColor: BORDER,
                }}
              >
                <Ionicons name="calendar-outline" size={20} color={ACCENT} />
              </TouchableOpacity>
            </View>

            {/* Tipo de produto */}
            <FormLabel>Tipo de Produto</FormLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {TIPOS.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setTipo(item)}
                  style={{
                    backgroundColor: tipo === item ? ACCENT + '22' : CARD,
                    borderWidth: 1,
                    borderColor: tipo === item ? ACCENT : BORDER,
                    paddingHorizontal: 14, paddingVertical: 9,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{
                    color: tipo === item ? ACCENT : SUB,
                    fontSize: 12, fontWeight: '600',
                  }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Marca */}
            <FormLabel>Marca</FormLabel>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {MARCAS.map(({ label, cor }) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => setMarca(label)}
                  style={{
                    backgroundColor: marca === label ? cor + '22' : CARD,
                    borderWidth: 1,
                    borderColor: marca === label ? cor : BORDER,
                    paddingHorizontal: 14, paddingVertical: 9,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{
                    color: marca === label ? cor : SUB,
                    fontSize: 13, fontWeight: '600',
                  }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Valores */}
            <FormLabel>Valores</FormLabel>
            <StyledInput
              placeholder="Valor Total"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
            <StyledInput
              placeholder="Entrada (opcional)"
              value={entrada}
              onChangeText={setEntrada}
              keyboardType="numeric"
            />

            {/* Parcelas + Intervalo */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <StyledInput
                  placeholder="Qtd. Parcelas"
                  value={parcelas}
                  onChangeText={setParcelas}
                  keyboardType="numeric"
                  noMargin
                />
              </View>
              <View style={{ flex: 1 }}>
                <StyledInput
                  placeholder="Intervalo (dias)"
                  value={intervaloDias}
                  onChangeText={setIntervaloDias}
                  keyboardType="numeric"
                  noMargin
                />
              </View>
            </View>

            {/* Produto */}
            <StyledInput
              placeholder="Descrição do produto (ex: Brinco Coração Duplo)"
              value={produto}
              onChangeText={setProduto}
              multiline
              style={{ minHeight: 80 }}
            />

            {/* Resumo */}
            <View style={{
              backgroundColor: CARD,
              borderRadius: 18,
              padding: 18,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: BORDER,
              overflow: 'hidden',
            }}>
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                backgroundColor: ACCENT, borderTopLeftRadius: 18, borderTopRightRadius: 18,
              }} />
              <Text style={{ color: SUB, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 }}>
                Resumo
              </Text>
              <View style={{ gap: 10 }}>
                <ResumoRow label="Valor total"     value={money(valorTotal)}   color={TXT}    />
                <ResumoRow label="Entrada"         value={money(valorEntrada)} color={GREEN}  />
                <View style={{ height: 1, backgroundColor: BORDER }} />
                <ResumoRow label="Falta receber"   value={money(faltaReceber)} color={ACCENT} bold />
                {qtdParcelas > 0 && (
                  <ResumoRow label={`Parcela (${qtdParcelas}x)`} value={money(valorParcela)} color={BLUE} />
                )}
              </View>
            </View>

            {/* Salvar */}
            <TouchableOpacity
              onPress={criarVenda}
              style={{
                backgroundColor: ACCENT,
                padding: 17,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: ACCENT,
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 }}>
                Salvar Venda
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
    </Modal>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormLabel({ children }) {
  return (
    <Text style={{ color: SUB, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function StyledInput({ placeholder, value, onChangeText, keyboardType, multiline, noMargin, style: extraStyle }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={SUB}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      style={[{
        backgroundColor: CARD,
        color: TXT,
        padding: 14,
        borderRadius: 14,
        fontSize: 14,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: noMargin ? 0 : 12,
      }, extraStyle]}
    />
  );
}

function ResumoRow({ label, value, color, bold }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: SUB, fontSize: 13 }}>{label}</Text>
      <Text style={{ color, fontSize: 14, fontWeight: bold ? '800' : '600' }}>{value}</Text>
    </View>
  );
}