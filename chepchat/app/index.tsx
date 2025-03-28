import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Home</Text>
      <Link href="/about">About</Link>
      <Link href="/profile">Profile</Link>
    </View>
  );
}
