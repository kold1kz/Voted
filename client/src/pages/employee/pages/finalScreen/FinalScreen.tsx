import { FC, useState } from 'react';

import VotingService from '../../../../api/votingService';
import FormButton from '../../../../components/FormButton/FormButton';
import styles from './styles.module.scss';

interface FinalScreenProps {
  isProtocolSent: boolean | null;
}

const FinalScreen: FC<FinalScreenProps> = ({ isProtocolSent }: FinalScreenProps) => {
  const [isLogout, setIsLogout] = useState(false);

  const makeLogout = async () => {
    setIsLogout(true);
    await VotingService.logout();
    setIsLogout(false);
    document.location.reload();
  };

  return (
    <div className={styles['wrapper']}>
      <div className={styles['final__content']}>
        <p className={styles['final__header']}>
          {isProtocolSent
            ? 'Спасибо за работу!'
            : 'Вы не ввели данные голосование окончено'}{' '}
        </p>
        <FormButton
          type="button"
          onClick={makeLogout}
          disabled={isLogout}
          className={styles['final__button']}>
          Выйти
        </FormButton>
      </div>
    </div>
  );
};

export default FinalScreen;
