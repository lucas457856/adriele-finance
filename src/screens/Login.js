import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../context/ThemeContext';
import { login } from '../services/api';

// 🔥 IMPORT IMPORTANTE
import { loadAndSync } from '../services/firebaseSync';

// ─── Palette de Destaque ─────────────────────────────────────────────────────
const ACCENT = '#A78BFA';
const GREEN  = '#34D399';

export default function Login({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme.dark;

  const bg     = isDark ? '#0F1219' : '#F0F2F8';
  const card   = isDark ? '#161B27' : '#FFFFFF';
  const border = isDark ? '#1E2330' : '#E2E6F0';
  const txt    = isDark ? '#E8ECF4' : '#1A1F2E';
  const sub    = isDark ? '#8892A4' : '#6B7590';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;

    try {
      setLoading(true);

      // 🔥 1. login primeiro
      await login(username, password);

      // 🔥 2. AGORA sincroniza notificações
      console.log('🔥 Rodando sync após login...');
      await loadAndSync();

      // 🔥 3. vai para dashboard
      navigation.replace('Dashboard');

    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const empty = !username || !password;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      
      {/* BOTÃO DE TRÊS BARRINHAS */}
      <TouchableOpacity 
        onPress={() => setMenuVisible(true)}
        style={{ 
          position: 'absolute', 
          top: 50, 
          right: 20, 
          zIndex: 10,
          backgroundColor: card,
          width: 44,
          height: 44,
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: border
        }}
      >
        <Ionicons name="menu-outline" size={24} color={txt} />
      </TouchableOpacity>

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>

        {/* Branding */}
        <View style={{
          backgroundColor: card,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: border,
          marginBottom: 24,
          overflow: 'hidden',
        }}>
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
        </View>

        {/* Form card */}
        <View style={{
          backgroundColor: card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: border,
          gap: 12,
        }}>
          <Text style={{ color: txt, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
            Entrar na conta
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: bg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            paddingHorizontal: 14,
            gap: 10,
          }}>
            <Ionicons name="person-outline" size={18} color={sub} />
            <TextInput
              placeholder="Usuário"
              placeholderTextColor={sub}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={{ flex: 1, color: txt, paddingVertical: 14, fontSize: 15 }}
            />
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: bg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            paddingHorizontal: 14,
            gap: 10,
          }}>
            <Ionicons name="lock-closed-outline" size={18} color={sub} />
            <TextInput
              placeholder="Senha"
              placeholderTextColor={sub}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              style={{ flex: 1, color: txt, paddingVertical: 14, fontSize: 15 }}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={sub} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || empty}
            activeOpacity={0.8}
            style={{
              backgroundColor: empty ? ACCENT + '44' : ACCENT,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              marginTop: 4,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              elevation: empty ? 0 : 6,
            }}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="log-in-outline" size={19} color="#fff" />}
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: sub, fontSize: 11, textAlign: 'center', marginTop: 24 }}>
          Versão 1.5.0
        </Text>
      </View>

      {/* MODAL DO MENU DE TEMA */}
      <Modal 
        visible={menuVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={{ 
            position: 'absolute', 
            top: 85, 
            right: 20, 
            backgroundColor: card, 
            borderRadius: 16, 
            padding: 8, 
            borderWidth: 1, 
            borderColor: border,
            minWidth: 160
          }}>
            <TouchableOpacity 
              onPress={() => {
                toggleTheme();
                setMenuVisible(false); // 🔥 CORRIGIDO AQUI
              }}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 10, 
                padding: 12 
              }}
            >
              <Ionicons 
                name={isDark ? 'sunny-outline' : 'moon-outline'} 
                size={20} 
                color={isDark ? '#FACC15' : '#6366F1'} 
              />
              <Text style={{ color: txt, fontWeight: '600' }}>
                {isDark ? 'Modo Claro' : 'Modo Escuro'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}
