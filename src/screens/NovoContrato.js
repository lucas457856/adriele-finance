import { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function NovoContrato({ route, navigation }) {
  const { cliente } = route.params;

  const [numero] = useState(
    Math.floor(Math.random() * 9000 + 1000)
  );

  const [data, setData] = useState('');
  const [marca, setMarca] = useState('Marva');
  const [valor, setValor] = useState('');
  const [entrada, setEntrada] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [intervalo, setIntervalo] = useState('30');
  const [obs, setObs] = useState('');

  const valorNumero = parseFloat(valor) || 0;
  const entradaNumero = parseFloat(entrada) || 0;
  const parcelasNumero = parseInt(parcelas) || 1;

  const faltaReceber = Math.max(
    valorNumero - entradaNumero,
    0
  );

  const valorParcela =
    parcelasNumero > 0
      ? faltaReceber / parcelasNumero
      : 0;

  function criarContrato() {
    Alert.alert(
      'Contrato criado',
      `Cliente: ${cliente?.nome}
Marca: ${marca}
Valor: R$ ${valorNumero.toFixed(2)}
Entrada: R$ ${entradaNumero.toFixed(2)}
Parcelas: ${parcelasNumero}x de R$ ${valorParcela.toFixed(2)}`
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0b0f14'
      }}
    >
      <ScrollView
        style={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 22,
              fontWeight: 'bold'
            }}
          >
            Nova Venda
          </Text>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Text
              style={{
                color: '#ff5555',
                fontSize: 24
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* NUMERO + DATA */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10
          }}
        >
          <TextInput
            value={String(numero)}
            editable={false}
            style={{
              flex: 1,
              backgroundColor: '#11161c',
              color: '#fff',
              padding: 12,
              borderRadius: 10,
              textAlign: 'center'
            }}
          />

          <TextInput
            placeholder="10/06/2026"
            placeholderTextColor="#8b949e"
            value={data}
            onChangeText={setData}
            style={{
              flex: 2,
              backgroundColor: '#11161c',
              color: '#fff',
              padding: 12,
              borderRadius: 10
            }}
          />
        </View>

        {/* CLIENTE */}
        <Text
          style={{
            color: '#8b949e',
            marginTop: 15
          }}
        >
          Cliente
        </Text>

        <TextInput
          value={cliente?.nome?.toUpperCase()}
          editable={false}
          style={{
            backgroundColor: '#11161c',
            color: '#fff',
            padding: 12,
            borderRadius: 10,
            marginTop: 5
          }}
        />

        {/* MARCA */}
        <Text
          style={{
            color: '#8b949e',
            marginTop: 15
          }}
        >
          Marca
        </Text>

        <TextInput
          value={marca}
          onChangeText={setMarca}
          placeholder="Marva"
          placeholderTextColor="#8b949e"
          style={{
            backgroundColor: '#11161c',
            color: '#fff',
            padding: 12,
            borderRadius: 10,
            marginTop: 5
          }}
        />

        {/* VALOR + ENTRADA */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 15
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#8b949e' }}>
              Valor Total
            </Text>

            <TextInput
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
              placeholder="450"
              placeholderTextColor="#8b949e"
              style={{
                backgroundColor: '#11161c',
                color: '#fff',
                padding: 12,
                borderRadius: 10,
                marginTop: 5
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#8b949e' }}>
              Entrada (Opcional)
            </Text>

            <TextInput
              keyboardType="numeric"
              value={entrada}
              onChangeText={setEntrada}
              placeholder="150"
              placeholderTextColor="#8b949e"
              style={{
                backgroundColor: '#11161c',
                color: '#fff',
                padding: 12,
                borderRadius: 10,
                marginTop: 5
              }}
            />
          </View>
        </View>

        {/* PARCELAS */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 15
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#8b949e' }}>
              Parcelas
            </Text>

            <TextInput
              keyboardType="numeric"
              value={parcelas}
              onChangeText={setParcelas}
              style={{
                backgroundColor: '#11161c',
                color: '#fff',
                padding: 12,
                borderRadius: 10,
                marginTop: 5,
                textAlign: 'center'
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#8b949e' }}>
              Intervalo (dias)
            </Text>

            <TextInput
              keyboardType="numeric"
              value={intervalo}
              onChangeText={setIntervalo}
              style={{
                backgroundColor: '#11161c',
                color: '#fff',
                padding: 12,
                borderRadius: 10,
                marginTop: 5,
                textAlign: 'center'
              }}
            />
          </View>
        </View>

        {/* OBS */}
        <Text
          style={{
            color: '#8b949e',
            marginTop: 15
          }}
        >
          Nome do Produto
        </Text>

        <TextInput
          placeholder="Observações..."
          placeholderTextColor="#8b949e"
          value={obs}
          onChangeText={setObs}
          style={{
            backgroundColor: '#11161c',
            color: '#fff',
            padding: 12,
            borderRadius: 10,
            marginTop: 5
          }}
        />

        {/* RESUMO */}
        <View
          style={{
            marginTop: 20
          }}
        >
          <Text
            style={{
              color: '#00bfff',
              fontSize: 17
            }}
          >
            Total: R$ {valorNumero.toFixed(2)}
          </Text>

          <Text
            style={{
              color: '#22c55e',
              fontSize: 17
            }}
          >
            Entrada: R$ {entradaNumero.toFixed(2)}
          </Text>

          <Text
            style={{
              color: '#ffffff',
              fontSize: 17
            }}
          >
            Parcelas: {parcelasNumero}x de R${' '}
            {valorParcela.toFixed(2)}
          </Text>

          <Text
            style={{
              color: '#facc15',
              fontSize: 17
            }}
          >
            Falta receber: R${' '}
            {faltaReceber.toFixed(2)}
          </Text>
        </View>

        {/* BOTÃO */}
        <TouchableOpacity
          onPress={criarContrato}
          style={{
            backgroundColor: '#22c55e',
            padding: 16,
            borderRadius: 12,
            marginTop: 25,
            marginBottom: 40
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            Criar Venda
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}