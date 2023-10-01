import { FC, ReactNode } from 'react';

import FormButton from '../FormButton/FormButton';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Modal } from '../Modal';
import styles from './styles.module.scss';

interface ConfirmPopupProps {
  onConfirm: () => void;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  isSubmitting?: boolean;
}

const ConfirmPopup: FC<ConfirmPopupProps> = ({
  onConfirm,
  onClose,
  title,
  children,
  isSubmitting,
}) => {
  return (
    <Modal>
      <div className={styles['popup__background']}>
        <div className={styles['popup__content']}>
          <div className={styles['popup__props']}>
            {title}
            {children && children}
          </div>

          <div className={styles['popup__buttons-block']}>
            <FormButton
              type={'button'}
              onClick={onClose}
              redColor
              className={styles['popup__button']}>
              Отмена
            </FormButton>
            <FormButton
              type={'button'}
              onClick={onConfirm}
              disabled={isSubmitting}
              className={styles['popup__button']}>
              {isSubmitting ? <LoadingSpinner /> : 'Подтвердить'}
            </FormButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmPopup;
