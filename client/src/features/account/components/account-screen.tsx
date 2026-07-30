import { closeView } from '@granite-js/react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTrackerUserKey } from 'shared/api/user-key';
import { SuspenseSection } from 'shared/components/async-state';
import { OriginalAppIcon } from 'shared/components/icons/pt-diary-icons';
import { TabPageLayout } from 'shared/components/tab-page-layout';
import Colors, { iosShadow } from 'shared/constants/colors';
import { buildAccountProfile } from '../lib/account-profile';

export function AccountScreen() {
  return (
    <TabPageLayout activeKey="condition" contentBottomSpacing={20}>
      {({ contentBottomInset }) => (
        <SuspenseSection errorMessage="사용자 정보를 불러오지 못했어요.">
          <AccountContent contentBottomInset={contentBottomInset} />
        </SuspenseSection>
      )}
    </TabPageLayout>
  );
}

function AccountContent({
  contentBottomInset,
}: { contentBottomInset: number }) {
  const userKey = useTrackerUserKey();
  const profile = buildAccountProfile(userKey);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { style: 'cancel', text: '취소' },
      {
        onPress: async () => {
          setLoggingOut(true);
          try {
            await closeView();
          } finally {
            setLoggingOut(false);
          }
        },
        style: 'destructive',
        text: '로그아웃',
      },
    ]);
  };

  return (
    <View style={[styles.content, { paddingBottom: contentBottomInset }]}>
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <OriginalAppIcon color={Colors.primary} name="person" size={36} />
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.displayName}</Text>
          <Text numberOfLines={1} style={styles.profileEmail}>
            {profile.secondaryText}
          </Text>
        </View>
      </View>

      <Pressable
        disabled={loggingOut}
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
      >
        <OriginalAppIcon color={Colors.danger} name="logOutOutline" size={20} />
        <Text style={styles.logoutButtonText}>
          {loggingOut ? '로그아웃 중…' : '로그아웃'}
        </Text>
      </Pressable>
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
    flex: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  logoutButton: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutButtonPressed: {
    opacity: 0.75,
  },
  logoutButtonText: {
    color: Colors.danger,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  profileCard: {
    ...iosShadow,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    padding: 20,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileEmail: {
    color: Colors.textMuted,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  profileName: {
    color: Colors.text,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
});
