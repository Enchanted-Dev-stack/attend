import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import AnalyticsSelector from '@/components/ui/AnalyticsSelector';
import { useLocalSearchParams } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { LineChart } from 'react-native-chart-kit';
import ViewShot from 'react-native-view-shot';

const screenWidth = Dimensions.get('window').width;

interface ClassAnalytics {
  summary: {
    totalStudents: number;
    averageAttendance: string;
    totalClasses: number;
    totalPresent: number;
    totalAbsent: number;
  };
  trends: {
    dateWiseStrength: Array<{
      date: string;
      strength: number;
      total: number;
      percentage: number;
    }>;
  };
  studentPerformance: Array<{
    name: string;
    rollNo: string;
    attendance: number;
    totalClasses: number;
  }>;
}

export default function ClassAnalyticsScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const chartRef = useRef();
  const [selectedMonth, setSelectedMonth] = useState(params.month?.toString() || 'jan');
  const [selectedSession, setSelectedSession] = useState(params.session?.toString() || '2024-25');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  const fetchClassAnalytics = async () => {
    if (!user?._id || !selectedCourse || !selectedSemester) return;
    
    setLoading(true);
    try {
      const url = `${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance/analytics/class?teacherId=${encodeURIComponent(user._id)}&course=${encodeURIComponent(selectedCourse)}&semester=${encodeURIComponent(selectedSemester)}&month=${encodeURIComponent(selectedMonth)}&session=${encodeURIComponent(selectedSession)}`;
      console.log('Fetching from URL:', url); // Debug log

      const response = await fetch(url);
      const text = await response.text(); // Get raw response text first
      
      try {
        console.log('Raw response:', text); // Debug log
        const data = JSON.parse(text);
        
        if (response.ok) {
          setAnalyticsData(data.analytics);
          setError('');
        } else {
          console.error('Error response:', data);
          setError(data.error || 'Failed to fetch analytics');
          setAnalyticsData(null);
        }
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        console.error('Response text:', text);
        setError('Invalid response from server');
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Failed to connect to server');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!analyticsData?.studentPerformance || !analyticsData?.trends?.dateWiseStrength) return;
    
    setExporting(true);
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create attendance data sheet
      const attendanceData = analyticsData.studentPerformance.map(student => ({
        'Name': student.name,
        'Roll No': student.rollNo,
        'Classes Attended': student.attendance,
        'Total Classes': student.totalClasses,
        'Attendance %': `${((student.attendance / student.totalClasses) * 100).toFixed(1)}%`
      }));

      const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
      XLSX.utils.book_append_sheet(wb, wsAttendance, "Attendance");

      // Set column widths for attendance sheet
      const colWidths = [
        { wch: 20 }, // Name
        { wch: 10 }, // Roll No
        { wch: 15 }, // Classes Attended
        { wch: 15 }, // Total Classes
        { wch: 12 }  // Attendance %
      ];
      wsAttendance['!cols'] = colWidths;

      // Create daily trends sheet with processed data
      const dateMap = new Map();
      analyticsData.trends.dateWiseStrength.forEach(day => {
        const dateKey = new Date(day.date).getDate().toString();
        if (dateMap.has(dateKey)) {
          const existing = dateMap.get(dateKey);
          existing.totalPercentage += day.percentage;
          existing.count += 1;
          existing.strength += day.strength;
          existing.total += day.total;
        } else {
          dateMap.set(dateKey, {
            date: day.date,
            totalPercentage: day.percentage,
            count: 1,
            strength: day.strength,
            total: day.total
          });
        }
      });

      const processedTrends = Array.from(dateMap.entries())
        .map(([date, data]) => ({
          'Date': new Date(data.date).toLocaleDateString(),
          'Present': Math.round(data.strength / data.count),
          'Total': Math.round(data.total / data.count),
          'Attendance %': `${(data.totalPercentage / data.count).toFixed(1)}%`,
          'Classes Count': data.count // Adding number of classes on this date
        }))
        .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

      const wsTrends = XLSX.utils.json_to_sheet(processedTrends);
      XLSX.utils.book_append_sheet(wb, wsTrends, "Daily Trends");

      // Set column widths for trends sheet
      wsTrends['!cols'] = [
        { wch: 12 }, // Date
        { wch: 10 }, // Present
        { wch: 10 }, // Total
        { wch: 12 }, // Attendance %
        { wch: 12 }  // Classes Count
      ];

      // Generate Excel file
      const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
        bookSST: false
      });
      
      // Generate filename with class and date info
      const date = new Date().toISOString().split('T')[0];
      const filename = `${selectedCourse}_${selectedSemester}_attendance_${date}.xlsx`;
      
      // Save and share Excel file
      const excelFilePath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(excelFilePath, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(excelFilePath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Attendance Data',
        UTI: 'org.openxmlformats.spreadsheetml.sheet'
      });

      // Clean up file
      await FileSystem.deleteAsync(excelFilePath);

    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Error', 'There was an error exporting the data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (selectedCourse && selectedSemester) {
      fetchClassAnalytics();
    }
  }, [selectedMonth, selectedSession, selectedCourse, selectedSemester, user?._id]);

  const handleCourseChange = (course: string, semester: string) => {
    setSelectedCourse(course);
    setSelectedSemester(semester);
  };

  const renderDetailedStats = () => {
    if (!analyticsData) return null;

    const { summary, trends, studentPerformance } = analyticsData;

    // Process trends data to average out duplicate dates
    const dateMap = new Map();
    trends?.dateWiseStrength?.forEach(day => {
      const dateKey = new Date(day.date).getDate().toString();
      if (dateMap.has(dateKey)) {
        const existing = dateMap.get(dateKey);
        existing.totalPercentage += day.percentage;
        existing.count += 1;
        existing.strength += day.strength;
        existing.total += day.total;
      } else {
        dateMap.set(dateKey, {
          date: day.date,
          totalPercentage: day.percentage,
          count: 1,
          strength: day.strength,
          total: day.total
        });
      }
    });

    // Convert map to sorted array and calculate averages
    const processedTrends = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date: data.date,
        percentage: data.totalPercentage / data.count,
        strength: Math.round(data.strength / data.count),
        total: Math.round(data.total / data.count)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare chart data with averaged values
    const chartData = {
      labels: processedTrends.map(day => 
        new Date(day.date).getDate().toString()
      ),
      datasets: [{
        data: processedTrends.map(day => day.percentage)
      }]
    };

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Class Summary</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Students</Text>
              <Text style={styles.detailValue}>{summary.totalStudents}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Average Attendance</Text>
              <Text style={styles.detailValue}>{summary.averageAttendance}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Classes</Text>
              <Text style={styles.detailValue}>{summary.totalClasses}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Present</Text>
              <Text style={styles.detailValue}>{summary.totalPresent}</Text>
            </View>
          </View>
        </View>

        {processedTrends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Trends</Text>
            <ViewShot ref={chartRef} options={{ format: "jpg", quality: 0.9 }}>
              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#007AFF'
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </ViewShot>
            {processedTrends.map((day, index) => (
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

        {studentPerformance?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Student Performance</Text>
              <TouchableOpacity 
                style={styles.exportButton}
                onPress={exportToExcel}
                disabled={exporting}
              >
                <MaterialIcons 
                  name="file-download" 
                  size={24} 
                  color="#007AFF"
                  style={exporting ? styles.iconDisabled : null}
                />
              </TouchableOpacity>
            </View>
            {studentPerformance.map((student, index) => (
              <View key={student.rollNo} style={styles.studentItem}>
                <View>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.rollNo}>Roll No: {student.rollNo}</Text>
                </View>
                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceText}>
                    {student.attendance}/{student.totalClasses}
                  </Text>
                  <Text style={styles.attendancePercent}>
                    {((student.attendance / student.totalClasses) * 100).toFixed(1)}%
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
        selectedCourse={selectedCourse}
        selectedSemester={selectedSemester}
        onMonthChange={setSelectedMonth}
        onSessionChange={setSelectedSession}
        onCourseChange={handleCourseChange}
        showClassSelection={true}
      />
      
      <ScrollView style={styles.scrollContent}>
        {!selectedCourse ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Select a class to view analytics</Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading class analytics...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
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
  courseHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  courseName: {
    fontSize: 24,
    fontFamily: 'Ralewaybold',
    color: '#000',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  studentItem: {
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Ralewaysemibold',
    color: '#000',
    marginBottom: 4,
  },
  rollNo: {
    fontSize: 13,
    fontFamily: 'Ralewayregular',
    color: '#666',
  },
  attendanceInfo: {
    alignItems: 'flex-end',
  },
  attendanceText: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#000',
    marginBottom: 4,
  },
  attendancePercent: {
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Ralewaymedium',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 12,
  },
  exportButton: {
    padding: 8,
  },
  iconDisabled: {
    opacity: 0.5,
  },
});
