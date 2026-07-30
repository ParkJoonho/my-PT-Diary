import { RowActionCard } from 'shared/components/row-action-card';
import { UnimplementedBadge } from 'shared/components/unimplemented-badge';
import { getAssetSource } from 'shared/lib/asset-url';

type QuickActionCardProps = {
  kind: 'outdoor' | 'guide';
  onPress?: () => void;
  showUnimplementedBadge?: boolean;
  subtitle: string;
  title: string;
};

const QUICK_IMAGES = {
  guide: getAssetSource('images/video.png'),
  outdoor: getAssetSource('images/shoes.png'),
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
