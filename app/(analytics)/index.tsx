import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import AnalyticsSelector from '@/components/ui/AnalyticsSelector';
import { useLocalSearchParams, router } from 'expo-router';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [selectedMonth, setSelectedMonth] = useState(params.month?.toString() || 'jan');
  const [selectedSession, setSelectedSession] = useState(params.session?.toString() || '2024-25');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance/analytics/teacher/${user._id}?month=${selectedMonth}&session=${selectedSession}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setAnalyticsData(data.analytics);
      } else {
        console.error('Error fetching analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedSession, user?._id]);

  const renderDetailedStats = () => {
    if (!analyticsData) return null;

    const { summary, engagement, trends } = analyticsData;
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Summary</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Classes</Text>
              <Text style={styles.detailValue}>{summary.totalAttendanceRecords}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Average Attendance</Text>
              <Text style={styles.detailValue}>{summary.averageAttendance}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Students</Text>
              <Text style={styles.detailValue}>{summary.totalStudentsMarked}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Present</Text>
              <Text style={styles.detailValue}>{summary.totalPresent}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Absent</Text>
              <Text style={styles.detailValue}>{summary.totalAbsent}</Text>
            </View>
          </View>
        </View>

        {engagement.mostEngagedClass && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Class Engagement</Text>
            <View style={styles.engagementItem}>
              <Text style={styles.label}>Most Engaged Class</Text>
              <Text style={styles.value}>
                {engagement.mostEngagedClass.course}
              </Text>
              <Text style={styles.subtext}>
                {engagement.mostEngagedClass.attendance.toFixed(1)}% attendance over {engagement.mostEngagedClass.sessions} sessions
              </Text>
            </View>
            {engagement.leastEngagedClass && (
              <View style={styles.engagementItem}>
                <Text style={styles.label}>Least Engaged Class</Text>
                <Text style={styles.value}>
                  {engagement.leastEngagedClass.course}
                </Text>
                <Text style={styles.subtext}>
                  {engagement.leastEngagedClass.attendance.toFixed(1)}% attendance over {engagement.leastEngagedClass.sessions} sessions
                </Text>
              </View>
            )}
            {engagement.mostEngagedSubject && (
              <View style={styles.engagementItem}>
                <Text style={styles.label}>Most Engaged Subject</Text>
                <Text style={styles.value}>
                  {engagement.mostEngagedSubject.subject}
                </Text>
                <Text style={styles.subtext}>
                  {engagement.mostEngagedSubject.attendance.toFixed(1)}% attendance over {engagement.mostEngagedSubject.sessions} sessions
                </Text>
              </View>
            )}
          </View>
        )}

        {trends?.dateWiseStrength?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Trends</Text>
            {trends.dateWiseStrength.map((day, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.date}>{new Date(day.date).toLocaleDateString()}</Text>
                <View style={styles.trendStats}>
                  <Text style={styles.trendValue}>
                    {day.strength}/{day.total} ({day.percentage.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <AnalyticsSelector
        selectedMonth={selectedMonth}
        selectedSession={selectedSession}
        onMonthChange={setSelectedMonth}
        onSessionChange={setSelectedSession}
      />
      
      <ScrollView style={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading detailed analytics...</Text>
          </View>
        ) : (
          renderDetailedStats()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EFFF',
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontFamily: 'Ralewayregular',
  },
  section: {
    marginHorizontal: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Ralewaybold',
    color: '#000',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 24,
    fontFamily: 'Ralewaybold',
    color: '#000',
  },
  engagementItem: {
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontFamily: 'Ralewaybold',
    color: '#000',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    fontFamily: 'Ralewayregular',
    color: '#666',
  },
  trendItem: {
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#000',
  },
  trendStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 15,
    fontFamily: 'Ralewaysemibold',
    color: '#000',
  },
});
