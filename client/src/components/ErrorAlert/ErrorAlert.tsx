import classNames from 'classnames';
import { FC } from 'react';

import AlertSvg from '../../img/alert.svg';
import styles from './styles.module.scss';

interface ErrorAlertProps {
  header: string;
  description: string;
  className?: string;
}

const ErrorAlert: FC<ErrorAlertProps> = (props) => {
  return (
    <div
      className={classNames(
        styles['error-alert'],
        props.className ? props.className : null,
      )}>
      <img src={AlertSvg} alt="Error img" className={styles['error-alert__icon']} />
      <div className={styles['error-alert__content']}>
        <span className={styles['error-alert__header']}>{props.header}</span>
        <span className={styles['error-alert__description']}>{props.description}</span>
      </div>
    </div>
  );
};

export default ErrorAlert;
