import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PantryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pantry</Text>
      {/* Pantry content will be implemented here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
