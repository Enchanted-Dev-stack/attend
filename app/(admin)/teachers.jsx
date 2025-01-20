import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { Modal, RefreshControl } from 'react-native';

const TeacherItem = ({ teacher }) => {
  const [imageError, setImageError] = useState(false);
  console.log('Teacher data:', JSON.stringify(teacher, null, 2)); // More detailed logging
  console.log('Profile pic URL:', teacher?.profilePic); // Specific logging for profile pic
  
  // Safely handle undefined teacher name
  const initial = teacher?.name?.charAt(0)?.toUpperCase() || '?';
  
  return (
    <View style={styles.teacherItem}>
      <View style={styles.teacherCard}>
        <View style={styles.teacherHeader}>
          {teacher?.profilePic && !imageError ? (
            <Image
              source={{ uri: teacher.profilePic }}
              style={[styles.teacherImage, { backgroundColor: '#f0f0f0' }]}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName}>{teacher?.name || 'Unknown Teacher'}</Text>
            <Text style={styles.teacherEmail}>{teacher?.email || 'No email'}</Text>
          </View>
        </View>
        <View style={styles.classesContainer}>
          {teacher?.classes?.map((classItem, index) => (
            <View key={index} style={styles.classChip}>
              <MaterialIcons name="class" size={16} color="#007AFF" style={styles.classIcon} />
              <Text style={styles.classChipText}>
                {`${classItem.course} ${classItem.semesterData?.sem || ''}`}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const AddTeacherForm = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [currentSubjects, setCurrentSubjects] = useState("");
  const [role, setRole] = useState("");
  const [Courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesterOptions, setSemesterOptions] = useState([]);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/courses`)
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  useEffect(() => {
    console.log("Selected course:", Courses);
  }, [Courses]);

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
    setSelectedSemester(""); // Reset semester when course changes

    // Find semesters for selected course
    const selectedCourseData = Courses.find((course) => course.course === value);
    if (selectedCourseData) {
      setSemesterOptions(selectedCourseData.semesters);
    } else {
      setSemesterOptions([]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const addClass = () => {
    if (selectedCourse && selectedSemester && currentSubjects) {
      // Convert comma-separated subjects into an array and trim whitespace
      const subjectsArray = currentSubjects.split(',').map(subject => subject.trim()).filter(subject => subject.length > 0);
      
      setClasses([
        ...classes,
        {
          course: selectedCourse,
          semesterData: {
            sem: selectedSemester,
            subjects: subjectsArray
          }
        }
      ]);
      setSelectedCourse("");
      setSelectedSemester("");
      setCurrentSubjects("");
      setSemesterOptions([]);
    }
  };

  const handleSubmit = () => {
    if (name && email && password && profilePic && classes.length > 0) {
      onAdd({ name, email, password, profilePic, classes, role });
      onClose();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.formContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>Add New Teacher</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#3B82F6" />
              <Text style={styles.imagePickerText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Role : Teacher/Hod"
          value={role}
          onChangeText={setRole}
        />
        <View style={styles.classesContainer}>
          <Text style={styles.sectionTitle}>Classes and Subjects</Text>
          
          {/* Display added classes */}
          {classes.map((item, index) => (
            <View key={index} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.courseText}>{item.course}</Text>
                <Text style={styles.semesterText}>Semester {item.semesterData.sem}</Text>
              </View>
              <View style={styles.subjectsContainer}>
                {item.semesterData.subjects.map((subject, subIndex) => (
                  <View key={subIndex} style={styles.subjectChip}>
                    <MaterialIcons name="subject" size={16} color="#007AFF" style={styles.subjectIcon} />
                    <Text style={styles.subjectText}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Add new class form */}
          <View style={styles.addClassSection}>
            <Text style={styles.addClassTitle}>Add New Class</Text>
            <View style={styles.pickerRow}>
              <View style={[styles.pickerContainer, { flex: 1 }]}>
                <Picker
                  mode="dropdown"
                  selectedValue={selectedCourse}
                  onValueChange={handleCourseChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Course" value="" />
                  {Courses.map((course, index) => (
                    <Picker.Item
                      key={index}
                      label={course.course}
                      value={course.course}
                    />
                  ))}
                </Picker>
              </View>
              <View style={[styles.pickerContainer, { flex: 1 }]}>
                <Picker
                  mode="dropdown"
                  selectedValue={selectedSemester}
                  onValueChange={setSelectedSemester}
                  style={styles.picker}
                  enabled={selectedCourse !== ""}
                >
                  <Picker.Item label="Select Semester" value="" />
                  {semesterOptions.map((semester, index) => (
                    <Picker.Item
                      key={index}
                      label={semester}
                      value={semester}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.subjectsInputContainer}>
              <TextInput
                style={styles.subjectsInput}
                placeholder="Enter subjects (comma-separated)"
                value={currentSubjects}
                onChangeText={setCurrentSubjects}
                multiline={true}
                numberOfLines={2}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!selectedCourse || !selectedSemester || !currentSubjects) &&
                    styles.addButtonDisabled,
                ]}
                onPress={addClass}
                disabled={!selectedCourse || !selectedSemester || !currentSubjects}
              >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Teacher</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const TeachersManagementScreen = () => {
  const [teachers, setTeachers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/teachers`
      );
      console.log('Teachers API full response:', {
        status: response.status,
        data: JSON.stringify(response.data, null, 2)
      });
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      ToastAndroid.show("Error fetching teachers", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (teacherData) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/teachers`,
        teacherData
      );
      setTeachers([...teachers, response.data]);
      setShowAddForm(false);
      ToastAndroid.show("Teacher added successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error adding teacher:", error);
      ToastAndroid.show("Error adding teacher", ToastAndroid.SHORT);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeachers();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading teachers...</Text>
        </View>
      ) : (
        <FlatList
          data={teachers}
          renderItem={({ item }) => <TeacherItem teacher={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddForm(true)}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {showAddForm && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAddForm}
          onRequestClose={() => setShowAddForm(false)}
        >
          <View style={styles.modalContainer}>
            <AddTeacherForm
              onClose={() => setShowAddForm(false)}
              onAdd={handleAddTeacher}
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  teacherItem: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Ralewaysemibold',
  },
  teacherImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 20,
    fontFamily: 'Ralewaysemibold',
    color: '#000',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    fontFamily: 'Ralewayregular',
    color: '#666',
  },
  classesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  classIcon: {
    marginRight: 4,
  },
  classChipText: {
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
    color: '#007AFF',
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    paddingHorizontal: 16,
    width: "97%",
    maxHeight: "90%",
  },
  formTitle: {
    fontSize: 24,
    fontFamily: "Montserratbold",
    color: "#1E40AF",
    marginBottom: 24,
    textAlign: "center",
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  imagePickerPlaceholder: {
    alignItems: "center",
  },
  imagePickerText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Ralewayregular",
    color: "#3B82F6",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  input: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontFamily: "Outfitregular",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Ralewaysemibold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  classCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseText: {
    fontSize: 16,
    fontFamily: 'Ralewaysemibold',
    color: '#1a1a1a',
  },
  semesterText: {
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
    color: '#6c757d',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f1ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subjectIcon: {
    marginRight: 4,
  },
  subjectText: {
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
    color: '#007AFF',
  },
  addClassSection: {
    marginTop: 24,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    width: '100%',
  },
  addClassTitle: {
    fontSize: 16,
    fontFamily: 'Ralewaysemibold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  subjectsInputContainer: {
    width: '100%',
    gap: 12,
  },
  subjectsInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 12,
    width: '100%',
    fontSize: 14,
    fontFamily: 'Ralewayregular',
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  addButtonDisabled: {
    backgroundColor: '#a8a8a8',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
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
});

export default TeachersManagementScreen;
