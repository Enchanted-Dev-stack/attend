import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const AdminOption = ({ icon, title, onPress, color }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.optionContainer, animatedStyle]}>
      <TouchableOpacity
        style={styles.option}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[color, color + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.optionText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuickStat = ({ title, value, color, icon }) => (
  <View style={styles.quickStat}>
    <LinearGradient
      colors={[color, color + '80']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.quickStatGradient}
    >
      <View style={styles.quickStatContent}>
        <Ionicons name={icon} size={24} color="#FFFFFF" style={styles.quickStatIcon} />
        <Text style={styles.quickStatValue}>{value}</Text>
        <Text style={styles.quickStatTitle}>{title}</Text>
      </View>
    </LinearGradient>
  </View>
);

export default function AdminPanelScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [analytics, setAnalytics] = React.useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    attendancePercentage: 0,
  });

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/analytics`);
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAnalytics().finally(() => setRefreshing(false));
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleNavigation = (screen) => {
    router.push(screen);
  };

  const menuItems = [
    { icon: 'people', title: 'Students', color: '#007AFF', route: '/(admin)/addstudents' },
    { icon: 'school', title: 'Teachers', color: '#8B5CF6', route: '/(admin)/teachers' },
    { icon: 'book', title: 'Courses', color: '#3B82F6', route: '/(admin)/courses' },
    { icon: 'calendar', title: 'Attendance', color: '#10B981', route: 'Attendance' },
    { icon: 'stats-chart', title: 'Reports', color: '#F59E0B', route: '/login' },
    { icon: 'time', title: 'Schedules', color: '#EF4444', route: 'Schedules' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#E8EFFF" style='dark' />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.optionsGrid}>
          {menuItems.map((item, index) => (
            <AdminOption
              key={index}
              icon={item.icon}
              title={item.title}
              color={item.color}
              onPress={() => handleNavigation(item.route)}
            />
          ))}
        </View>

        <View style={styles.quickStatsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <QuickStat 
              title="Total Students" 
              value={analytics.totalStudents.toString()}
              color="#007AFF"
              icon="people" 
            />
            <QuickStat 
              title="Active Courses" 
              value={analytics.totalCourses.toString()}
              color="#10B981"
              icon="book" 
            />
            <QuickStat 
              title="Teachers" 
              value={analytics.totalTeachers.toString()}
              color="#8B5CF6"
              icon="school" 
            />
            <QuickStat 
              title="Attendance" 
              value={`${analytics.attendancePercentage}%`}
              color="#F59E0B"
              icon="stats-chart" 
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 16,
    marginTop: 24,
    fontFamily: 'Ralewaysemibold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  optionContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  option: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    padding: 20,
    height: 130,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Ralewaysemibold',
  },
  quickStatsContainer: {
    marginTop: 0,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStat: {
    width: cardWidth,
    marginBottom: 16,
  },
  quickStatGradient: {
    borderRadius: 16,
    padding: 16,
    height: 120,
  },
  quickStatContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  quickStatIcon: {
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Ralewaybold',
  },
  quickStatTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontFamily: 'Ralewaybold',
  },
});
