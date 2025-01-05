import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#E8EFFF' }}>
      <StatusBar backgroundColor="#E8EFFF" style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{ headerShown: false, title: "Home" }}
        />
        <Tabs.Screen
          name="attendence"
          options={{ headerShown: false, title: "Take" }}
        />
        <Tabs.Screen
          name="profile"
          options={{ headerShown: false, title: "Profile" }}
        />
      </Tabs>
    </View>
  );
}
