import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import StudentAttendanceList from "@/components/ui/StudentList";
import { useAuth } from "@/context/AuthContext";
import TopSheet from "@/components/ui/TopSheet";
import ClassSelector from "@/components/ui/ClassSelector";

const generateDates = () => {
  const dates = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Generate dates from 2 days before to 5 days after
  for (let i = -2; i < 6; i++) {
    const currentDate = new Date('2025-01-03'); // Using the provided current date
    currentDate.setDate(currentDate.getDate() + i);
    
    dates.push({
      date: currentDate.toISOString().split('T')[0],
      day: daysOfWeek[currentDate.getDay()]
    });
  }
  
  return dates;
};

const dates = generateDates();

export default function Attendence() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState(new Date('2025-01-03').toISOString().split('T')[0]);
  const [teacherData, setTeacherData] = React.useState<any>(null);
  const [studentsList, setStudentsList] = useState([]);
  const [isClassSelectorVisible, setIsClassSelectorVisible] = useState(false);

  // Selection states
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!user?._id) return;
        const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/teachers/id/${user._id}`);
        const data = await response.json();
        setTeacherData(data);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };

    fetchTeacherData();
  }, [user?._id]);

  const handleClassSelect = async (course: string, semester: string, subject: string) => {
    setSelectedClass(course);
    setSelectedSemester(semester);
    setSelectedSubject(subject);
    setIsClassSelectorVisible(false);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/students/byCourse?course=${course}&semester=${semester}`
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const studentsWithAttendance = data.map(student => ({
          ...student,
          isPresent: false
        }));
        setStudentsList(studentsWithAttendance);
      } else {
        console.log('API Response:', data);
        setStudentsList([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudentsList([]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.classSelector}
        onPress={() => setIsClassSelectorVisible(true)}
      >
        {selectedClass ? (
          <Text style={styles.selectedClassText}>
            {selectedClass} • {selectedSemester} • {selectedSubject}
          </Text>
        ) : (
          <Text style={styles.selectClassText}>Select a class to take attendance</Text>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.scrollContent}>
        {/* Date Selection */}
        <View style={styles.section}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroller}
          >
            {dates.map((item) => (
              <TouchableOpacity
                key={item.date}
                style={[
                  styles.dateCard,
                  selectedDate === item.date && styles.selectedDateCard
                ]}
                onPress={() => setSelectedDate(item.date)}
              >
                <Text style={[
                  styles.dateText,
                  selectedDate === item.date && styles.selectedDateText
                ]}>
                  {new Date(item.date).getDate().toString().padStart(2, '0')}
                </Text>
                <Text style={[
                  styles.dateDay,
                  selectedDate === item.date && styles.selectedDateText
                ]}>
                  {item.day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Students List */}
        {studentsList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Students</Text>
              <Text style={styles.presentCount}>
                Present: {studentsList.filter(s => s.isPresent).length}/{studentsList.length}
              </Text>
            </View>
            <StudentAttendanceList 
              students={studentsList} 
              setStudents={setStudentsList}
              selectedDate={selectedDate}
              course={selectedClass}
              semester={selectedSemester}
              subject={selectedSubject}
              teacherId={user?._id}
            />
          </View>
        )}
      </ScrollView>

      <TopSheet
        isVisible={isClassSelectorVisible}
        onClose={() => setIsClassSelectorVisible(false)}
        title="Select Class"
      >
        <ClassSelector
          selectedClass={selectedClass}
          selectedSemester={selectedSemester}
          selectedSubject={selectedSubject}
          classOptions={teacherData?.classes || []}
          onSelect={handleClassSelect}
        />
      </TopSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EFFF',
  },
  classSelector: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  selectedClassText: {
    fontSize: 16,
    fontFamily: 'Ralewaymedium',
    color: '#000',
  },
  selectClassText: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#666',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Ralewaybold',
    color: '#000',
    marginBottom: 12,
  },
  dateScroller: {
    flexGrow: 0,
    marginBottom: 8,
  },
  dateCard: {
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedDateCard: {
    backgroundColor: '#007AFF',
  },
  dateDay: {
    fontSize: 13,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    marginTop: 4,
  },
  dateText: {
    fontSize: 24,
    fontFamily: 'Ralewaybold',
    color: '#000',
  },
  selectedDateText: {
    color: '#fff',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presentCount: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#666',
  },
});
