import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "shared/constants/colors";
import type {
  BodyPartFilterItem,
  EquipmentFilterItem,
} from "../types/exercise-guide";

type ExerciseGuideFilterRowProps =
  | {
      items: BodyPartFilterItem[];
      mode: "body";
      selectedKey: string;
      onSelect: (key: string) => void;
    }
  | {
      items: EquipmentFilterItem[];
      mode: "equipment";
      selectedKey: string;
      onSelect: (key: string) => void;
    };

export function ExerciseGuideFilterRow(props: ExerciseGuideFilterRowProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {props.items.map((item) => {
        const active = props.selectedKey === item.key;

        return (
          <Pressable
            key={item.key}
            onPress={() => props.onSelect(item.key)}
            style={styles.item}
          >
            <View
              style={[
                styles.iconWrap,
                props.mode === "equipment" && styles.labelWrap,
                active && styles.iconWrapActive,
              ]}
            >
              {props.mode === "body" ? (
                "image" in item && item.image ? (
                  <Image source={item.image} style={styles.bodyImage} />
                ) : (
                  <Text
                    style={[styles.allText, active && styles.allTextActive]}
                  >
                    All
                  </Text>
                )
              ) : (
                <Text
                  style={[
                    styles.equipmentText,
                    active && styles.equipmentTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  allText: {
    color: "#b0b0b0",
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
  },
  allTextActive: {
    color: Colors.accent,
  },
  bodyImage: {
    height: 40,
    width: 40,
  },
  equipmentText: {
    color: Colors.textMuted,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 12,
  },
  equipmentTextActive: {
    color: Colors.accent,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: Colors.card,
    borderColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconWrapActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  item: {
    alignItems: "center",
    gap: 6,
    width: 60,
  },
  label: {
    color: Colors.textMuted,
    fontFamily: "Pretendard-Regular",
    fontSize: 11,
  },
  labelActive: {
    color: Colors.accent,
    fontFamily: "Pretendard-SemiBold",
  },
  labelWrap: {
    paddingHorizontal: 8,
    width: 60,
  },
  scroll: {
    gap: 10,
    paddingHorizontal: 16,
  },
});
