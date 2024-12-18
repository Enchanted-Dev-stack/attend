import { Feather } from "@expo/vector-icons";

export const icon = {
  index: (props: any) => (
    <Feather
      name="home" // Home icon (outlined)
      size={24}
      color={props.isFocused ? "#fff" : "#222"}
    />
  ),
  profile: (props: any) => (
    <Feather
      name="user" // User icon (outlined)
      size={24}
      color={props.isFocused ? "#fff" : "#222"}
    />
  ),
  attendence: (props: any) => (
    <Feather
      name="feather" // You can choose any feather icon you prefer
      size={24}
      color={props.isFocused ? "#fff" : "#222"}
    />
  ),
};