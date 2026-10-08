import React, {useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {loginUser} from '../src/services/api';

function LoginScreen({navigation}: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      Alert.alert(
        'Missing information',
        'Please enter your username and password.',
      );
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(
        cleanUsername,
        password,
      );

      const user = response?.user;

      if (!user) {
        throw new Error(
          'Login response did not contain user information.',
        );
      }

      navigation.replace('Home', {
        user,
      });
    } catch (error: any) {
      Alert.alert(
        'Login failed',
        error?.message ||
          'Unable to login. Please check your username and password.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <View style={styles.content}>

          <View style={styles.logoContainer}>
            <Text style={styles.logo}>👶</Text>
          </View>

          <Text style={styles.title}>
            Neonatal Care Assistant
          </Text>

          <Text style={styles.subtitle}>
            Secure neonatal monitoring and
            clinical decision support
          </Text>

          <View style={styles.loginCard}>

            <Text style={styles.cardTitle}>
              Welcome Back
            </Text>

            <Text style={styles.cardSubtitle}>
              Sign in to access your baby's health
              information.
            </Text>

            <Text style={styles.label}>
              Username
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}>

              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.loginButtonText}>
                  Sign In
                </Text>
              )}

            </TouchableOpacity>

            <View style={styles.securityBox}>
              <Text style={styles.securityIcon}>
                🔐
              </Text>

              <Text style={styles.securityText}>
                Your account is protected with
                secure password authentication.
              </Text>
            </View>

          </View>

          <Text style={styles.footer}>
            Hospital-oriented research prototype
          </Text>

          <Text style={styles.footerSmall}>
            For monitoring and clinical decision support
          </Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },

  logo: {
    fontSize: 38,
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 22,
  },

  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },

  loginButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    padding: 11,
    marginTop: 16,
  },

  securityIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  securityText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    marginTop: 20,
  },

  footerSmall: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});

export default LoginScreen;