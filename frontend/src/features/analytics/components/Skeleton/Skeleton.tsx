import {
  SkeletonCard,
  SkeletonContainer,
  SkeletonLine,
} from '@/components/Skeleton';
import styles from './Skeleton.module.scss';
import SkeletonButton from '@/components/Skeleton/Button/Button';

const Skeleton = () => {
  return (
    <div className={styles.analytics}>
      {/* Metrics */}
      <SkeletonContainer variant="grid_repeat" repeat={8}>
        {(i) => (
          <SkeletonCard key={i} variant="md">
            <SkeletonLine type="title" />
            <SkeletonLine type="text" />
          </SkeletonCard>
        )}
      </SkeletonContainer>

      <SkeletonCard variant="xl">
        {/* Header */}
        <SkeletonContainer>
          <SkeletonCard withBg={false}>
            <SkeletonLine type="title" />
            <SkeletonLine type="text" variant="lg" />
            <SkeletonLine type="title" variant="lg" />
          </SkeletonCard>
          <SkeletonContainer repeat={5}>
            {(i) => <SkeletonButton key={i} />}
          </SkeletonContainer>
          <SkeletonCard variant="md">
            <SkeletonLine type="title" />
            <SkeletonLine type="text" variant="md" />
          </SkeletonCard>
        </SkeletonContainer>

        {/* Summary */}
        <SkeletonContainer variant="grid" repeat={4}>
          {(i) => (
            <SkeletonCard key={i} variant="md">
              <SkeletonLine type="title" />
              <SkeletonLine type="text" variant="md" />
            </SkeletonCard>
          )}
        </SkeletonContainer>

        {/* Chart */}
        <SkeletonCard variant="lg">
          <div className={styles.zeroLine} />
        </SkeletonCard>
      </SkeletonCard>
    </div>
  );
};

export default Skeleton;
