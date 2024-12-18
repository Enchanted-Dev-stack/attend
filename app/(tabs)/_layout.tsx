import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    // <SafeAreaView style={{ flex: 1 }}>
      <>
      <Tabs tabBar={(props) => <TabBar {...props} />}>
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
      <StatusBar backgroundColor="#F0FFFF" style="dark"/>
      </>
    // </SafeAreaView>
  );
}
