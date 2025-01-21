import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import ClassSelector from '@/components/ui/ClassSelector';
import StudentList from '@/components/ui/StudentList';

export default function StudentsScreen() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSemester) {
      fetchStudents();
    }
  }, [selectedClass, selectedSemester]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      console.log('Fetching courses from:', `${BASE_URL}/api/courses`);
      
      const response = await axios.get(`${BASE_URL}/api/courses`);
      console.log('Courses response:', response.data);
      
      if (Array.isArray(response.data)) {
        // Transform the courses data to match ClassSelector format
        const transformedCourses = [];
        response.data.forEach(courseData => {
          courseData.semesters.forEach(semester => {
            transformedCourses.push({
              course: courseData.course,
              semesterData: {
                sem: semester,
                subjects: [] // We'll add subjects later if needed
              }
            });
          });
        });
        
        console.log('Transformed courses:', transformedCourses);
        setCourses(transformedCourses);
      } else {
        setError('Invalid course data format');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error loading courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      console.log('Fetching students for:', { selectedClass, selectedSemester });
      
      const response = await axios.get(`${BASE_URL}/api/students/byCourse`, {
        params: {
          course: selectedClass,
          semester: selectedSemester
        }
      });
      console.log('Students response:', response.data);
      
      if (response.data.success) {
        setStudents(response.data.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Error loading students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (course, semester, subject) => {
    console.log('Selected:', { course, semester, subject });
    setSelectedClass(course);
    setSelectedSemester(semester);
    setSelectedSubject(subject);
  };

  if (loading && !courses.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <ClassSelector
            selectedClass={selectedClass}
            selectedSemester={selectedSemester}
            selectedSubject={selectedSubject}
            classOptions={courses}
            onSelect={handleClassSelect}
          />
          {selectedClass && selectedSemester && (
            <StudentList
              students={students}
              showAttendance={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Ralewaymedium',
  },
});
