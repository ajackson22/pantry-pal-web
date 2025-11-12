import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function MealPlanScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meal Plan</Text>
      {/* Meal plan content will be implemented here */}
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
