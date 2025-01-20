import { View, Text, TouchableOpacity, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "./TabBarButton";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ width: 100, height: 20 });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (event: LayoutChangeEvent) => {
    setDimensions({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  return (
    <View
      onLayout={onTabbarLayout}
      // className="absolute bottom-[30px] left-1/2 -translate-x-1/2 bg-white flex flex-row justify-between items-center gap-2 max-w-[250px] px-4 rounded-full py-[10px]"
      style={{
        position: "absolute",
        // borderColor: "blue",
        // borderWidth: 1,
        // zIndex: 999,
        elevation: 1,
        bottom: 20,
        left: "50%",
        transform: [{ translateX: -125 }],
        backgroundColor: "white",
        borderRadius: 30,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        maxWidth: 250,
        paddingVertical: 10,
        // paddingHorizontal: 4,
        alignItems: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            // backgroundColor: "#723FEB",
            borderRadius: 30,
            // marginHorizontal: 15,
            height: dimensions.height - 15,
            width: buttonWidth,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <View
          style={{
            width: buttonWidth - 18,
            height: dimensions.height - 15,
            backgroundColor: Colors.original.tabBarBg,
            borderRadius: 30,
          }}
        ></View>
      </Animated.View>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            duration: 1500,
          });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={index}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            label={label}
          />
          // <TouchableOpacity
          //   key={index}
          //   accessibilityRole="button"
          //   accessibilityState={isFocused ? { selected: true } : {}}
          //   accessibilityLabel={options.tabBarAccessibilityLabel}
          //   testID={options.tabBarTestID}
          //   onPress={onPress}
          //   onLongPress={onLongPress}
          //   style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          // >
          //   {icon[route.name] && icon[route.name]({isFocused})}
          //   <Text style={{ color: isFocused ? "#673ab7" : "#222" }}>
          //     {label}
          //   </Text>
          // </TouchableOpacity>
        );
      })}
    </View>
  );
}
