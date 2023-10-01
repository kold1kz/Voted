import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import styles from './styles.module.scss';

interface FormButtonProps {
  type: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  redColor?: boolean;
}

const FormButton: FC<FormButtonProps> = ({
  type,
  className,
  disabled,
  children,
  onClick,
  redColor,
}) => {
  return (
    <button
      type={type}
      className={classNames(
        styles['form-button'],
        redColor ? styles['form-button_color_red'] : null,
        className,
        disabled ? styles['form-button_color_gray'] : null,
      )}
      disabled={!!disabled}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default FormButton;
