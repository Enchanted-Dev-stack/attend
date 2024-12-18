import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Button,
  Alert,
  FlatList,
  Text,
  View,
  StyleSheet,
  ScrollView,
  ToastAndroid,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import { TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export default function ExcelFilePicker() {
  const [data, setData] = useState([]); // State to hold the parsed Excel data
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [allcourses, setAllCourses] = useState([]);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  // New state to store selected course and semester in an object
  const [selectedInfo, setSelectedInfo] = useState({
    course: null,
    semester: null,
    students: [],
  });

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/courses`)
      .then((response) => setAllCourses(response.data))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    console.log("All courses:", allcourses);
  }, [allcourses]);

  const pickFile = async () => {
    try {
      console.log("Opening document picker...");
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allow any file type for debugging purposes
        copyToCacheDirectory: true,
      });

      console.log("Document picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("File picked successfully:", file.name);

        // Read the file and parse the Excel data
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0]; // Get the first sheet name
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Parse data as an array of arrays
          // console.log("Parsed Excel data:", jsonData);

          // Convert array of arrays to an array of objects
          const headers = jsonData[0]; // First row as headers
          const formattedData = jsonData.slice(1).map((row) => {
            return headers.reduce((obj, header, index) => {
              obj[header] = row[index]; // Create object with key-value pairs
              return obj;
            }, {});
          });
          setStudentsList(formattedData);
          selectedInfo.students = formattedData;

          setData(jsonData); // Set the parsed data to state
        };

        reader.readAsArrayBuffer(blob); // Read the blob as an ArrayBuffer
      } else {
        console.log("File selection canceled or error occurred.");
        Alert.alert("File selection canceled");
      }
    } catch (error) {
      console.error("Error during file selection:", error);
      Alert.alert("Error", "An error occurred while picking the file.");
    }
  };


  const handleSubmit = () => {
    axios.post(`${BASE_URL}/api/students`, selectedInfo).then((response) => {
      console.log(response.data);
      ToastAndroid.show("Students added successfully", ToastAndroid.SHORT);
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show("Error", ToastAndroid.SHORT);
    });
  };

  // Update selectedInfo when the course or semester changes
  const handleCourseChange = (value) => {
    setSelectedCourse(value);
    setSelectedInfo((prev) => ({ ...prev, course: value }));
  };

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
    setSelectedInfo((prev) => ({ ...prev, semester: value }));
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        onPress={pickFile}
        style={{ backgroundColor: "black", borderRadius: 10, padding: 10 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="document-text-outline" size={24} color="white" />
          <Text
            style={{
              color: "white",
              textAlign: "center",
              paddingLeft: 10, // Add some space between the icon and text
              fontWeight: "bold",
            }}
          >
            Pick File
          </Text>
        </View>
      </TouchableOpacity>

      {/* <Button title="Pick an Excel File"  /> */}
      <ScrollView horizontal>
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()} // Use index as key for simplicity
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.map((cell, idx) => (
                <View key={idx} style={idx === 0 ? styles.cell0 : styles.cell}>
                  <Text style={styles.cellText}>{cell}</Text>
                </View>
              ))}
            </View>
          )}
          ListEmptyComponent={<Text>No data to display.</Text>}
        />
      </ScrollView>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            gap: 10,
          }}
        >
          <View style={styles.pickerContainer}>
            <Picker
              mode="dropdown"
              selectedValue={selectedCourse}
              onValueChange={handleCourseChange} // Update function here
              style={styles.picker}
            >
              {allcourses?.map((option, index) => (
                <Picker.Item
                  key={index}
                  label={option.course}
                  value={option.course}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              mode="dropdown"
              selectedValue={selectedSemester}
              onValueChange={handleSemesterChange} // Update function here
              style={styles.picker}
            >
              {allcourses.find((course) => course.course === selectedCourse)
                ?.semesters.map((option, index) => (
                  <Picker.Item
                    key={index}
                    label={option}
                    value={option}
                  />
                ))
              }
            </Picker>
          </View>
          {/* <Picker.Item
                  key={index}
                  label={option.label}
                  value={option.value}
                /> */}
        </View>
        <LinearGradient
          colors={["#4854f8", "#89ddff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 13 }}
        >
          <TouchableOpacity onPress={() => handleSubmit()}>
            <Text style={styles.buttonText}>Add Students</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pickerContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "white",
    elevation: 1,
    marginBottom: 7,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  cell0: {
    flex: 1,
    minWidth: 30, // Set a minimum width for cells to prevent congestion
    padding: 10,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
  cell: {
    flex: 1,
    minWidth: 120, // Set a minimum width for cells to prevent congestion
    padding: 10,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
  cellText: {
    fontSize: 14,
    textAlign: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "SpaceMono",
  },
});
