import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import StudentAttendanceList from "@/components/ui/StudentList";

const dates = [
  {
    date: "2022-01-01",
    day: "Sunday",
  },
  {
    date: "2022-01-02",
    day: "Monday",
  },
  {
    date: "2022-01-03",
    day: "Tuesday",
  },
  {
    date: "2022-01-04",
    day: "Wednesday",
  },
  {
    date: "2022-01-05",
    day: "Thursday",
  },
  {
    date: "2022-01-06",
    day: "Friday",
  },
  {
    date: "2022-01-07",
    day: "Saturday",
  },
];

export default function Attendence() {
  const [selectedClass, setSelectedClass] = React.useState("class");
  const [selectedPeriod, setSelectedPeriod] = React.useState("1st");

  const options = [
    { label: "Class", value: "class" },
    { label: "BCA I", value: "english" },
    { label: "BCA II", value: "spanish" },
    { label: "BCA III", value: "french" },
    { label: "BCOM I", value: "maths" },
    { label: "BCOM II", value: "physics" },
  ];
  const Periodoptions = [
    { label: "1st", value: "1st" },
    { label: "Foundation Course", value: "english" },
    { label: "DSA", value: "spanish" },
    { label: "Networking", value: "french" },
  ];

  return (
    <View style={styles.container}>
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
            selectedValue={selectedClass}
            onValueChange={setSelectedClass}
            style={styles.picker}
          >
            {options.map((option, index) => (
              <Picker.Item
                key={index}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            mode="dropdown"
            selectedValue={selectedClass}
            onValueChange={setSelectedClass}
            style={styles.picker}
          >
            {Periodoptions.map((option, index) => (
              <Picker.Item
                key={index}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>
      <ScrollView
        style={styles.dates}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {dates.map((date, index) => (
          <View
            key={index}
            style={[
              styles.dateItemsContainer,
              index === 2 ? { backgroundColor: "#3085fd" } : {},
            ]}
          >
            <Text
              style={[styles.dateDay, index === 2 ? { color: "white" } : {}]}
            >
              {date.date.split("-")[2]}
            </Text>
            <Text
              style={[styles.dateItems, index === 2 ? { color: "white" } : {}]}
            >
              {date.day.slice(0, 3)}
            </Text>
          </View>
        ))}
      </ScrollView>
      <StudentAttendanceList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 7,
    backgroundColor: "#f8f8f8",
  },
  dates: {
    flexGrow: 0,
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
    height: 40,
    width: "100%",
  },
  dateItemsContainer: {
    aspectRatio: 1,
    width: 70,
    borderRadius: 13,
    backgroundColor: "white",
    marginRight: 5,
    marginLeft: 2,
    marginVertical: 1,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1,
  },
  dateItems: {
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "SpaceMono",
  },
  dateDay: {
    fontSize: 30,
    fontFamily: "SpaceMono",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
