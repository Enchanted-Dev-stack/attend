import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CourseCard = ({ course }) => {
  return (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <Text style={styles.courseName}>{course.course}</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.semestersScrollContainer}
      >
        {course.semesters.map((semester, index) => (
          <View key={index} style={styles.semesterChip}>
            <Ionicons name="school" size={16} color="#007AFF" style={styles.semesterIcon} />
            <Text style={styles.semesterText}>{semester}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const SemesterBadge = ({ semester, index, onEdit, onRemove }) => {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.semesterBadge, animatedStyle]}>
      <Text style={styles.semesterBadgeText}>{semester}</Text>
      <View style={styles.semesterBadgeActions}>
        <TouchableOpacity
          onPress={() => onEdit(semester, index)}
          style={styles.semesterBadgeAction}
        >
          <Ionicons name="pencil" size={16} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRemove(index)}
          style={styles.semesterBadgeAction}
        >
          <Ionicons name="close" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const AddCourseForm = ({ onClose, onAdd }) => {
  const [courseName, setCourseName] = useState('');
  const [currentSemester, setCurrentSemester] = useState('');
  const [semesterCount, setSemesterCount] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSemesterIndex, setEditingSemesterIndex] = useState(null);

  const handleAddSemester = () => {
    if (currentSemester.trim()) {
      const newSemesters = currentSemester
        .split(',')
        .map(sem => sem.trim())
        .filter(sem => sem !== '');
      
      if (editingSemesterIndex !== null) {
        const updatedSemesters = [...semesters];
        updatedSemesters[editingSemesterIndex] = newSemesters[0];
        setSemesters(updatedSemesters);
        setEditingSemesterIndex(null);
      } else {
        setSemesters([...semesters, ...newSemesters]);
      }
      setCurrentSemester('');
    }
  };

  const handleEditSemester = (index) => {
    setCurrentSemester(semesters[index]);
    setEditingSemesterIndex(index);
  };

  const handleDeleteSemester = (index) => {
    setSemesters(semesters.filter((_, i) => i !== index));
  };

  const handleGenerateSemesters = (count) => {
    const num = parseInt(count);
    if (!isNaN(num) && num > 0 && num <= 8) {
      const numberWords = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'];
      const generatedSemesters = numberWords.slice(0, num).map(word => `${word} Semester`);
      setSemesters(generatedSemesters);
      setSemesterCount('');
    }
  };

  const handleSubmit = async () => {
    if (!courseName.trim() || semesters.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      await axios.post(`${BASE_URL}/api/courses`, {
        course: courseName,
        semesters,
      });
      onAdd();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Add New Course</Text>
      
      <TextInput
        style={styles.formInput}
        placeholder="Course Name"
        value={courseName}
        onChangeText={setCourseName}
        placeholderTextColor="#666"
      />

      <Text style={styles.sectionTitle}>Semesters</Text>
      
      <View style={styles.semesterInputContainer}>
        <TextInput
          style={[styles.formInput, { flex: 1 }]}
          placeholder="Add Semester"
          value={currentSemester}
          onChangeText={setCurrentSemester}
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={styles.addSemesterButton}
          onPress={handleAddSemester}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.semesterCountContainer}>
        <TextInput
          style={[styles.formInput, { flex: 1 }]}
          placeholder="Or enter number of semesters (1-8)"
          value={semesterCount}
          onChangeText={setSemesterCount}
          keyboardType="number-pad"
          maxLength={1}
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={[styles.addSemesterButton, !semesterCount && styles.addButtonDisabled]}
          onPress={() => handleGenerateSemesters(semesterCount)}
          disabled={!semesterCount}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.semesterList}
        contentContainerStyle={styles.semesterListContent}
      >
        {semesters.map((semester, index) => (
          <View key={index} style={styles.semesterChip}>
            <View style={styles.semesterContent}>
              <Ionicons name="school" size={16} color="#007AFF" style={styles.semesterIcon} />
              <Text style={styles.semesterChipText}>{semester}</Text>
            </View>
            <View style={styles.semesterActions}>
              <TouchableOpacity 
                onPress={() => handleEditSemester(index)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={14} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteSemester(index)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={14} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!courseName.trim() || semesters.length === 0) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!courseName.trim() || semesters.length === 0 || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Adding Course...' : 'Submit Course'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      const response = await axios.get(`${BASE_URL}/api/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCourses().finally(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#E8EFFF', '#E8EFFF', '#F8FBFF']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LinearGradient colors={['#E8EFFF', '#E8EFFF', '#F8FBFF']} style={styles.container}>
        <FlatList
          data={courses}
          renderItem={({ item }) => <CourseCard course={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Add Course Modal */}
        {showAddForm && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showAddForm}
            onRequestClose={() => setShowAddForm(false)}
          >
            <View style={styles.modalContainer}>
              <AddCourseForm onClose={() => setShowAddForm(false)} onAdd={fetchCourses} />
            </View>
          </Modal>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Ralewaymedium',
    color: '#666',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontFamily: 'Ralewaysemibold',
    color: '#1a1a1a',
  },
  semestersScrollContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 8,
  },
  semesterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  semesterIcon: {
    marginRight: 4,
  },
  semesterText: {
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
    color: '#007AFF',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Ralewaysemibold',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Ralewaysemibold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Ralewayregular',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  semesterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  semesterCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  addSemesterButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#A8A8A8',
  },
  semesterList: {
    maxHeight: 80,
  },
  semesterListContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#A8A8A8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Ralewaysemibold',
  },
  semesterChipText: {
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
    color: '#007AFF',
  },
  semesterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  semesterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 4,
  },
});