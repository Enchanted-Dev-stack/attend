import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  useNavigationState,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
// import "../global.css";

import { useColorScheme } from "react-native";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Handjet: require("../assets/fonts/Handjet-VariableFont_wght.ttf"),
    Rubik: require("../assets/fonts/Rubik-VariableFont_wght.ttf"),
    MavenPro: require("../assets/fonts/MavenPro-VariableFont_wght.ttf"),
    Montserrat: require("../assets/fonts/Montserrat-VariableFont_wght.ttf"),
    Outfit: require("../assets/fonts/Outfit-VariableFont_wght.ttf"),
    //Raleway
    Ralewaynormal: require("../assets/fonts/Raleway/static/Raleway-Black.ttf"),
    Ralewaybold: require("../assets/fonts/Raleway/static/Raleway-Bold.ttf"),
    Ralewaylight: require("../assets/fonts/Raleway/static/Raleway-Light.ttf"),
    Ralewaymedium: require("../assets/fonts/Raleway/static/Raleway-Medium.ttf"),
    Ralewayregular: require("../assets/fonts/Raleway/static/Raleway-Regular.ttf"),
    Ralewaysemibold: require("../assets/fonts/Raleway/static/Raleway-SemiBold.ttf"),
    Ralewaythin: require("../assets/fonts/Raleway/static/Raleway-Thin.ttf"),

    //Poppins
    Poppinsbold: require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    Poppinslight: require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    Poppinsmedium: require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    Poppinsregular: require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    Poppinssemibold: require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    Poppinsthin: require("../assets/fonts/Poppins/Poppins-Thin.ttf"),

    //Montserrat
    Montserratbold: require("../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
    Montserratlight: require("../assets/fonts/Montserrat/static/Montserrat-Light.ttf"),
    Montserratmedium: require("../assets/fonts/Montserrat/static/Montserrat-Medium.ttf"),
    Montserratregular: require("../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    Montserratsemibold: require("../assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf"),
    Montserratthin: require("../assets/fonts/Montserrat/static/Montserrat-Thin.ttf"),

    //MavenPro
    MavenProbold: require("../assets/fonts/Maven_Pro/static/MavenPro-Bold.ttf"),
    MavenPromedium: require("../assets/fonts/Maven_Pro/static/MavenPro-Medium.ttf"),
    MavenProregular: require("../assets/fonts/Maven_Pro/static/MavenPro-Regular.ttf"),
    MavenProsemibold: require("../assets/fonts/Maven_Pro/static/MavenPro-SemiBold.ttf"),

    //Outfit
    Outfitbold: require("../assets/fonts/Outfit/static/Outfit-Bold.ttf"),
    Outfitlight: require("../assets/fonts/Outfit/static/Outfit-Light.ttf"),
    Outfitmedium: require("../assets/fonts/Outfit/static/Outfit-Medium.ttf"),
    Outfitregular: require("../assets/fonts/Outfit/static/Outfit-Regular.ttf"),
    Outfitsemibold: require("../assets/fonts/Outfit/static/Outfit-SemiBold.ttf"),
  });

  //   const state = useNavigationState((state) => state);
  // console.log("Current Route:", state.routes[state.index]);

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //     console.log("loaded");
  //   }
  // }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="about/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(admin)/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(admin)/addstudents"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(admin)/courses"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaView>
          <StatusBar
            barStyle={colorScheme === "dark" ? "dark-content" : "dark-content"}
          />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
