import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';

const firebaseConfig = {
  apiKey: "AIzaSyB6se8-V09v5EZCZZzSAVUTL4ZSVaIwUig",
  databaseURL: "https://dht-monitor-69917-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écoute la dernière valeur
    const latestRef = ref(db, '/readings/latest');
    onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTemperature(data.temperature);
        setHumidity(data.humidity);
        setLastUpdate(moment().format('HH:mm:ss'));
        setLoading(false);
      }
    });

    // Écoute l'historique
    const historyRef = ref(db, '/readings/history');
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data).slice(-10); // 10 dernières valeurs
        setHistory(entries);
      }
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00b4d8" />
        <Text style={styles.loadingText}>Connexion à Firebase...</Text>
      </View>
    );
  }

  const chartData = {
    labels: history.map((_, i) => `${i + 1}`),
    datasets: [
      {
        data: history.map(h => h.temperature),
        color: () => '#ff6b6b',
        strokeWidth: 2,
      },
      {
        data: history.map(h => h.humidity),
        color: () => '#00b4d8',
        strokeWidth: 2,
      },
    ],
    legend: ['Température (°C)', 'Humidité (%)'],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌿 DHT22 Monitor</Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.label}>🌡️ Température</Text>
          <Text style={styles.value}>{temperature}°C</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>💧 Humidité</Text>
          <Text style={styles.value}>{humidity}%</Text>
        </View>
      </View>

      <Text style={styles.timestamp}>
        Dernière mise à jour : {lastUpdate}
      </Text>

      <Text style={styles.sectionTitle}>📈 Historique</Text>

      {history.length > 1 ? (
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1b2838',
            backgroundGradientFrom: '#1b2838',
            backgroundGradientTo: '#1b2838',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => '#adb5bd',
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.loadingText}>En attente de données historiques...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0d1b2a',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00b4d8',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  card: {
    backgroundColor: '#1b2838',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: 155,
  },
  label: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timestamp: {
    color: '#adb5bd',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    alignSelf: 'flex-start',
    paddingLeft: 20,
  },
  chart: {
    borderRadius: 16,
  },
  loadingText: {
    color: '#adb5bd',
    marginTop: 10,
  },
});