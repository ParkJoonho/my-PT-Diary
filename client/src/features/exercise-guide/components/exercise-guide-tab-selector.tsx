import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors, { iosShadowLight } from "shared/constants/colors";
import type { ExerciseGuideTab } from "../types/exercise-guide";

export function ExerciseGuideTabSelector({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: ExerciseGuideTab;
  onSelectTab: (tab: ExerciseGuideTab) => void;
}) {
  const tabs: ExerciseGuideTab[] = ["부위별", "기구별"];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = selectedTab === tab;

        return (
          <Pressable
            key={tab}
            onPress={() => onSelectTab(tab)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.text, active && styles.activeText]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    ...iosShadowLight,
    backgroundColor: Colors.card,
  },
  activeText: {
    color: Colors.text,
    fontFamily: "Pretendard-SemiBold",
  },
  container: {
    backgroundColor: "#eaeaea",
    borderRadius: 12,
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 9,
  },
  text: {
    color: Colors.textMuted,
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
  },
});
