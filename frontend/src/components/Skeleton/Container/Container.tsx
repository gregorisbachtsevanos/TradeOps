import { ReactNode } from 'react';
import styles from './Container.module.scss';

interface SkeletonContainerProps {
  children: ReactNode | ((index: number) => ReactNode);
  variant?: 'default' | 'grid' | 'grid_repeat';
  repeat?: number;
}

const SkeletonContainer = ({
  children,
  variant = 'default',
  repeat,
}: SkeletonContainerProps) => {
  const className =
    variant === 'default' ? styles.container : styles[`container__${variant}`];

  const renderChildren = () => {
    if (!repeat) {
      return typeof children === 'function' ? children(0) : children;
    }

    return Array.from({ length: repeat }).map((_, index) =>
      typeof children === 'function' ? children(index) : children,
    );
  };

  return <div className={className}>{renderChildren()}</div>;
};

export default SkeletonContainer;
