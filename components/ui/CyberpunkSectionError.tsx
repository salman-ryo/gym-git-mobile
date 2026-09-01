import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { AlertTriangle, RefreshCcw } from 'lucide-react-native';

interface CyberpunkSectionErrorProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export default function CyberpunkSectionError({
  title = 'System Glitch',
  message = 'Failed to establish connection to the mainframe.',
  onRetry,
}: CyberpunkSectionErrorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertTriangle color={Colors.redAlert} size={32} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
        <RefreshCcw color={Colors.dark.foreground} size={16} />
        <Text style={styles.retryText}>RETRY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 150,
  },
  iconContainer: {
    marginBottom: 12,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.redAlert,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  message: {
    color: Colors.dark.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: Colors.redAlert,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 8,
  },
  retryText: {
    color: Colors.dark.foreground,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

