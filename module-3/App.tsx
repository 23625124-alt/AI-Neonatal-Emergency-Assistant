import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CarePlanScreen from './screens/CarePlanScreen';

const Stack = createNativeStackNavigator();

function HomeScreen({navigation}: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Neonatal Care Assistant</Text>
          <Text style={styles.subtitle}>
            Intelligent care & decision support for your baby
          </Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome 👶</Text>
          <Text style={styles.welcomeText}>
            Monitor your baby's health and get personalized care guidance.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>❤️</Text>
            <Text style={styles.cardTitle}>Baby Health</Text>
            <Text style={styles.cardText}>
              View baby's current health information
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CarePlan')}>
            <Text style={styles.cardIcon}>🍼</Text>
            <Text style={styles.cardTitle}>Care Plan</Text>
            <Text style={styles.cardText}>
              Personalized daily care recommendations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>⏰</Text>
            <Text style={styles.cardTitle}>Reminders</Text>
            <Text style={styles.cardText}>
              Feeding, medicine and vaccination reminders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🤖</Text>
            <Text style={styles.cardTitle}>AI Guidance</Text>
            <Text style={styles.cardText}>
              Get intelligent neonatal care assistance
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>🚨 Emergency Support</Text>
          <Text style={styles.alertText}>
            Get timely alerts when abnormal health conditions are detected.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="CarePlan"
          component={CarePlanScreen}
          options={{title: 'Care Plan'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  header: {
    padding: 24,
    paddingTop: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
  },

  welcomeCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#E8F4F8',
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#164E63',
  },

  welcomeText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    lineHeight: 21,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  cardContainer: {
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
  },

  cardIcon: {
    fontSize: 28,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },

  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  alertCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BE123C',
  },

  alertText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },
});

export default App;