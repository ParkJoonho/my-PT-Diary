import { RowActionCard } from 'shared/components/row-action-card';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';

type QuickActionCardProps = {
  kind: 'outdoor' | 'guide';
  onPress?: () => void;
  showUnimplementedBadge?: boolean;
  subtitle: string;
  title: string;
};

const QUICK_IMAGES = {
  outdoor: require('../../../assets/images/shoes.png'),
  guide: require('../../../assets/images/video.png'),
};

export function QuickActionCard({
  kind,
  onPress,
  showUnimplementedBadge = true,
  subtitle,
  title,
}: QuickActionCardProps) {
  return (
    <RowActionCard
      imageSource={QUICK_IMAGES[kind]}
      onPress={onPress ?? (() => undefined)}
      subtitle={subtitle}
      title={title}
      titleAccessory={
        showUnimplementedBadge ? <UnimplementedBadge compact /> : undefined
      }
    />
  );
}
