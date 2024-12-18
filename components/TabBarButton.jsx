import React, { useEffect } from "react";
import { GestureResponderEvent, Pressable, Text } from "react-native";
import { icon } from "../app/constants/TabBarIcon";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export default function TabBarButton({
  onPress,
  onLongPress,
  label,
  isFocused,
  routeName,
})
// : {
//   onPress: (event: GestureResponderEvent) => void;
//   onLongPress: (event: GestureResponderEvent) => void;
//   label: string;
//   isFocused: boolean;
//   routeName: keyof typeof icon;
// }): JSX.Element 
{

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused, {
      duration: 350,
    });
  }, [isFocused, scale]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  })

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [0, 8]);

    return {
      transform: [{ scale: scaleValue }],
      top,
    };
  })

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Animated.View style={[animatedIconStyle]}>
      {icon[routeName] && icon[routeName]({ isFocused })}
      </Animated.View>
      <Animated.Text style={[{ color: isFocused ? "#673ab7" : "#222" }, animatedTextStyle]}>{label}</Animated.Text>
    </Pressable>
  );
}