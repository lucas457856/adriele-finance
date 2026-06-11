import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function FechamentoPeriodo() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Fechamento por período</Text>
        <TouchableOpacity>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* DATE PICKERS */}
      <View style={styles.dateContainer}>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>16/4/2026</Text>
        </View>

        <View style={styles.dateBox}>
          <Text style={styles.dateText}>16/4/2026</Text>
        </View>
      </View>

      {/* CONTENT (VAZIO) */}
      <View style={styles.content} />

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Resumo do período 💰</Text>

        <View style={styles.summary}>
          <Text style={styles.label}>Valor:</Text>
          <Text style={styles.green}>R$0,00</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.label}>Multa:</Text>
          <Text style={styles.blue}>R$0,00</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.label}>Despesas:</Text>
          <Text style={styles.red}>R$0,00</Text>
        </View>
      </View>
    </View>
  );
}