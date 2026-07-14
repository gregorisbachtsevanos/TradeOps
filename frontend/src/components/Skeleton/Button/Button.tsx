import styles from './Button.module.scss';

interface SkeletonButtonProps {}

const SkeletonButton = ({}: SkeletonButtonProps) => {
  return <div className={styles.button}></div>;
};

export default SkeletonButton;
