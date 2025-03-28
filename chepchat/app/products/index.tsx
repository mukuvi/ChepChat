import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function productList() {
  return (
    <View>
      <Text style={styles.container}>product List</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    textAlign: "center",
  },
});
