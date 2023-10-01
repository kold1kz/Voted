import classNames from 'classnames';
import { FC } from 'react';

import styles from './styles.module.scss';

interface LoadingSpinnerProps {
  className?: string;
  isPrimaryColor?: boolean;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ className, isPrimaryColor }) => {
  return (
    <div
      className={classNames(
        styles['spinner'],
        isPrimaryColor ? styles['spinner_primary-color'] : null,
        className ? className : null,
      )}></div>
  );
};

export default LoadingSpinner;
