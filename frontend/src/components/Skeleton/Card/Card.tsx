import styles from './Card.module.scss';

interface SkeletonCardProps {
  children: React.ReactNode;
  variant?: 'md' | 'lg' | 'xl';
  withBg?: boolean;
}

const SkeletonCard = ({
  children,
  variant = 'md',
  withBg = true,
}: SkeletonCardProps) => {
  const className = [styles[`card__${variant}`], !withBg && styles.card__no_bg]
    .filter(Boolean)
    .join(' ');

  return <div className={className}>{children}</div>;
};

export default SkeletonCard;
