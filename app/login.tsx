import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { Dumbbell, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const { login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <LinearGradient colors={['#09090b', '#0f291e', '#09090b']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <LinearGradient
          colors={['#18181b', '#111827']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' }}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}
            >
              <Dumbbell size={30} color="#09090b" />
            </LinearGradient>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#10b981', letterSpacing: -0.5 }}>Gym-Git</Text>
            <Text style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>Commit your workouts like code</Text>
          </View>

          {/* Mode Switcher */}
          <View style={{ flexDirection: 'row', backgroundColor: '#09090b', padding: 4, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: '#27272a' }}>
            <TouchableOpacity
              onPress={() => { setMode('signin'); setErrorMsg(''); }}
              style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
            >
              {mode === 'signin' ? (
                <LinearGradient colors={['#10b981', '#059669']} style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 13, color: '#09090b' }}>Sign In</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: '#a1a1aa' }}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMode('signup'); setErrorMsg(''); }}
              style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
            >
              {mode === 'signup' ? (
                <LinearGradient colors={['#10b981', '#059669']} style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 13, color: '#09090b' }}>Create Account</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: '#a1a1aa' }}>Create Account</Text>
                </View>
              )}
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
            style={{ backgroundColor: '#27272a', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#3f3f46' }}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#09090b', borderRadius: 12, borderWidth: 1, borderColor: '#27272a', paddingRight: 14 }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor="#71717a"
                style={{ flex: 1, color: '#f4f4f5', paddingHorizontal: 14, paddingVertical: 12 }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color="#a1a1aa" />
                ) : (
                  <Eye size={18} color="#a1a1aa" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={{ borderRadius: 14, overflow: 'hidden' }}>
            <LinearGradient colors={['#10b981', '#059669']} style={{ paddingVertical: 14, alignItems: 'center' }}>
              {submitting ? (
                <ActivityIndicator color="#09090b" />
              ) : (
                <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>
                  {mode === 'signup' ? 'Create Account & Start' : 'Sign In'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
}
