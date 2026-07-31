import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

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
    <LinearGradient colors={[Colors.dark.background, Colors.dark.background]} style={{ flex: 1 }}>
      {/* Background Glow Points */}
      <View style={{ position: 'absolute', top: '10%', left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(20, 184, 166, 0.06)' }} />
      <View style={{ position: 'absolute', bottom: '15%', right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(168, 85, 247, 0.06)' }} />

      {/* Watermarks */}
      <Image
        source={require('@/assets/images/ggdumbell.webp')}
        style={{
          position: 'absolute',
          top: '5%',
          right: '-10%',
          width: 200,
          height: 200,
          opacity: 0.07,
          transform: [{ rotate: '-15deg' }],
          resizeMode: 'contain',
        }}
      />
      <Image
        source={require('@/assets/images/gggit.webp')}
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-5%',
          width: 220,
          height: 220,
          opacity: 0.07,
          transform: [{ rotate: '10deg' }],
          resizeMode: 'contain',
        }}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <LinearGradient
          colors={[Colors.dark.card, 'rgba(23, 23, 23, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#27272a' }}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: 56, height: 56, borderRadius: 18, marginBottom: 12 }}
            />
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#fafafa', letterSpacing: -0.5 }}>Gym-Git</Text>
            <Text style={{ fontSize: 13, color: Colors.dark.mutedForeground, marginTop: 4 }}>Commit your workouts like code</Text>
          </View>

          {/* Mode Switcher */}
          <View style={{ flexDirection: 'row', backgroundColor: '#09090b', padding: 4, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: '#27272a' }}>
            <TouchableOpacity
              onPress={() => { setMode('signin'); setErrorMsg(''); }}
              style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
            >
              {mode === 'signin' ? (
                <LinearGradient colors={['#06b6d4', '#0891b2']} style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 13, color: '#09090b' }}>Sign In</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: '#71717a' }}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMode('signup'); setErrorMsg(''); }}
              style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
            >
              {mode === 'signup' ? (
                <LinearGradient colors={['#06b6d4', '#0891b2']} style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 13, color: '#09090b' }}>Create Account</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: '#71717a' }}>Create Account</Text>
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
            style={{ backgroundColor: 'rgba(38,38,38,0.6)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(63,63,70,0.6)' }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Inputs */}
          {mode === 'signup' && (
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Alex Developer"
                placeholderTextColor="#52525b"
                style={{ backgroundColor: 'rgba(24,24,27,0.5)', color: '#ffffff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#27272a' }}
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
              placeholderTextColor="#52525b"
              style={{ backgroundColor: 'rgba(24,24,27,0.5)', color: '#ffffff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#27272a' }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(24,24,27,0.5)', borderRadius: 12, borderWidth: 1, borderColor: '#27272a', paddingRight: 14 }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor="#52525b"
                style={{ flex: 1, color: '#ffffff', paddingHorizontal: 14, paddingVertical: 12 }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color="#52525b" />
                ) : (
                  <Eye size={18} color="#52525b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{ borderRadius: 14, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={['#047857', '#4b0a83ff']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ paddingVertical: 14, alignItems: 'center' }}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>
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
