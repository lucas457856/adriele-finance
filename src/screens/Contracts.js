import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { getContratos } from '../services/contracts';

export default function Contracts({ navigation }) {

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const data = await getContratos();
      setContratos(Array.isArray(data) ? data : []);

    } catch (err) {
      console.log('❌ erro contratos:', err);
      setContratos([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================= RESUMO =================
  const totalContratos = contratos.length;

  const totalInvestido = contratos.reduce((acc, item) => {
    return acc + (item.valor || 0);
  }, 0);

  const totalLucro = contratos.reduce((acc, item) => {
    return acc + (item.lucro || 0);
  }, 0);

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#0b0f14',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#fff' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#0b0f14',
      padding: 15
    }}>

      {/* ================= RESUMO ================= */}
      <View style={{
        backgroundColor: '#11161c',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15
      }}>

        <Text style={{ color: '#fff', fontSize: 18 }}>
          Bem-vindo 👋
        </Text>

        <Text style={{ color: '#8b949e', marginTop: 10 }}>
          Total de Vendas: {totalContratos}
        </Text>

        <Text style={{ color: '#4da3ff', marginTop: 5 }}>
          Total investido: R$ {totalInvestido.toFixed(2)}
        </Text>

        <Text style={{ color: '#39d353', marginTop: 5 }}>
          Lucro: R$ {totalLucro.toFixed(2)}
        </Text>

      </View>

      {/* ================= BOTÃO VER CONTRATOS ================= */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ListContracts')}
        style={{
          backgroundColor: '#ff4d4f',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10
        }}
      >
        <Text style={{ textAlign: 'center', color: '#fff' }}>
          Ver Vendas
        </Text>
      </TouchableOpacity>

      {/* ================= BOTÃO VOLTAR ================= */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        style={{
          backgroundColor: '#39d353',
          padding: 15,
          borderRadius: 10
        }}
      >
        <Text style={{ textAlign: 'center', color: '#000' }}>
          Voltar para Dashboard
        </Text>
      </TouchableOpacity>

    </View>
  );
}