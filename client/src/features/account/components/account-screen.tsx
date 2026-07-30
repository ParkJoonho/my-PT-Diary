import { ShieldCheck, UserRound } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTrackerUserKey } from 'shared/api/user-key';
import { SuspenseSection } from 'shared/components/async-state';
import { TabPageLayout } from 'shared/components/tab-page-layout';
import Colors, { iosShadow } from 'shared/constants/colors';
import { buildAccountProfile } from '../lib/account-profile';
import { AccountBackground } from './account-background';

export function AccountScreen() {
  return (
    <TabPageLayout activeKey="condition" contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <>
          <AccountBackground />

          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: contentBottomInset },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>내 정보</Text>
              <Text style={styles.title}>개인 페이지</Text>
              <Text style={styles.subtitle}>
                현재 앱에서 사용하는 사용자 식별 정보를 확인할 수 있어요.
              </Text>
            </View>

            <SuspenseSection errorMessage="사용자 정보를 불러오지 못했어요.">
              <AccountProfileCard />
            </SuspenseSection>
          </ScrollView>
        </>
      )}
    </TabPageLayout>
  );
}

function AccountProfileCard() {
  const userKey = useTrackerUserKey();
  const profile = buildAccountProfile(userKey);

  return (
    <View style={[styles.profileCard, iosShadow]}>
      <View style={styles.avatarCircle}>
        <UserRound color={Colors.primary} size={34} strokeWidth={2.2} />
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.profileHeaderRow}>
          <Text style={styles.profileName}>{profile.displayName}</Text>
          {profile.isDevelopmentPreview ? (
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>미리보기</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.profileDetail}>{profile.detailText}</Text>
        <Text style={styles.profileHelper}>{profile.helperText}</Text>
      </View>

      <View style={styles.userKeyPanel}>
        <View style={styles.userKeyHeader}>
          <ShieldCheck color={Colors.accent} size={16} strokeWidth={2.2} />
          <Text style={styles.userKeyLabel}>사용자 키</Text>
        </View>
        <Text selectable style={styles.userKeyValue}>
          {profile.userKeyLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  eyebrow: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
  },
  previewBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewBadgeText: {
    color: Colors.accent,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  profileDetail: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  profileHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileHelper: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  profileInfo: {
    gap: 6,
  },
  profileName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 26,
  },
  titleBlock: {
    gap: 4,
    paddingTop: 2,
  },
  userKeyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  userKeyLabel: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
  userKeyPanel: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  userKeyValue: {
    color: Colors.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    lineHeight: 19,
  },
});
