import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useFocusEffect, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    return 3;
  };

  const strengthColors = ["#E2E8F0", "#10B981", "#10B981"];
  const strength = getStrength();

  return (
    <View style={styles.strengthContainer}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.strengthBar,
            {
              backgroundColor:
                index < strength ? strengthColors[strength] : "#E2E8F0",
            },
          ]}
        />
      ))}
      <Text
        style={[
          styles.strengthText,
          { color: strength > 0 ? "#10B981" : "#94A3B8" },
        ]}
      >
        {strength === 0
          ? ""
          : strength === 1
          ? "Weak"
          : strength === 2
          ? "Good"
          : "Strong"}
      </Text>
    </View>
  );
};

export default function SignUpScreen() {

  const {user, login, loading} = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
const router = useRouter();
  const formTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const headerOpacity = useSharedValue(0);
  const socialOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0);
    formOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    formTranslateY.value = withDelay(200, withSpring(0));
    socialOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  // const socialStyle = useAnimatedStyle(() => ({
  //   opacity: socialOpacity.value,
  // }));

  const handleSignIn = () => {
    login(email, password);
  };

  // useFocusEffect(() => {
  //   const checkUserData = async () => {
      
  //     if (user) {
  //       // User data exists, redirect to tabs
  //       console.log("data exists");
  //       router.replace('/(tabs)'); // Make sure to replace 'Tabs' with your actual tab navigator name
  //     }else{
  //       console.log("data does not exist");
  //     }
  //     console.log(user);
  //   };
  
  //   checkUserData();
  // });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Image
          source={{ uri: 'https://cdn.dribbble.com/users/45810/screenshots/834093/paper-icon.gif' }}
          style={{ width: 200, height: 200 }}
        />
      </SafeAreaView>
    );
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={"#4F46E5"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          {/* <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity> */}
        </View>

        <Animated.View style={[styles.titleContainer, headerStyle]}>
          <Text style={styles.title}>Get started free.</Text>
          <Text style={styles.subtitle}>
            Attendance today, success tomorrow.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.form, formStyle]}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94A3B8"
            />
            <PasswordStrength password={password} />
          </View>

          <TouchableOpacity onPress={() => handleSignIn()}>
            <LinearGradient
              colors={["#393dd9", "#eaa1fd"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpButtonText}>Sign in</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* <Animated.View style={[styles.socialContainer, socialStyle]}>
          <Text style={styles.socialText}>Or sign up with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Image 
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image 
                source={{ uri: 'https://www.facebook.com/favicon.ico' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </Animated.View> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  signInButton: {
    padding: 8,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  titleContainer: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#E0E7FF",
    opacity: 0.8,
    fontFamily: "SpaceMono",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 4,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    width: 24,
    borderRadius: 2,
    marginRight: 4,
  },
  strengthText: {
    fontSize: 12,
    marginLeft: 8,
  },
  signUpButton: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  socialContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  socialText: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 6,
  },
  socialIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  socialButtonText: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "500",
  },
});
