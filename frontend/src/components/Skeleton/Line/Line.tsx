import styles from './Line.module.scss';

interface SkeletonLineProps {
  type?: 'title' | 'text';
  variant?: 'default' | 'md' | 'lg' | 'xl';
}

const SkeletonLine = ({
  type = 'text',
  variant = 'default',
}: SkeletonLineProps) => {
  const className =
    variant === 'default' ? styles[type] : styles[`${type}__${variant}`];

  return <div className={className} />;
};

export default SkeletonLine;
