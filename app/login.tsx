import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';

export default function LoginScreen() {
  const { login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    if (mode === 'signup' && !name) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      router.replace('/');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#09090b', justifyContent: 'center', padding: 20 }}>
      <View style={{ backgroundColor: '#18181b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272a' }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Dumbbell size={28} color="#09090b" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#10b981' }}>Gym-Git</Text>
          <Text style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>Commit your workouts like code</Text>
        </View>

        {/* Mode Switcher */}
        <View style={{ flexDirection: 'row', backgroundColor: '#09090b', padding: 4, borderRadius: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => { setMode('signin'); setErrorMsg(''); }}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: mode === 'signin' ? '#10b981' : 'transparent', alignItems: 'center' }}
          >
            <Text style={{ fontWeight: '700', fontSize: 13, color: mode === 'signin' ? '#09090b' : '#a1a1aa' }}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setMode('signup'); setErrorMsg(''); }}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: mode === 'signup' ? '#10b981' : 'transparent', alignItems: 'center' }}
          >
            <Text style={{ fontWeight: '700', fontSize: 13, color: mode === 'signup' ? '#09090b' : '#a1a1aa' }}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {errorMsg !== '' && (
          <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}>
            <Text style={{ color: '#f87171', fontSize: 12 }}>{errorMsg}</Text>
          </View>
        )}

        {/* Google OAuth Button */}
        <TouchableOpacity
          onPress={loginWithGoogle}
          style={{ backgroundColor: '#27272a', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: '#f4f4f5', fontWeight: '700', fontSize: 14 }}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Inputs */}
        {mode === 'signup' && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Alex Developer"
              placeholderTextColor="#71717a"
              style={{ backgroundColor: '#09090b', color: '#f4f4f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#27272a' }}
            />
          </View>
        )}

        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#71717a"
            style={{ backgroundColor: '#09090b', color: '#f4f4f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#27272a' }}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#71717a"
            style={{ backgroundColor: '#09090b', color: '#f4f4f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#27272a' }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{ backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
        >
          {submitting ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>
              {mode === 'signup' ? 'Create Account & Start' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
