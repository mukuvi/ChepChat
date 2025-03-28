import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";

export default function productList() {
  return (
    <View style={styles.container}>
      <Text>product List</Text>
      <Link href="/">Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
});
