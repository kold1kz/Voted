import { FC, useContext } from 'react';

import TurnoutList from '../../../../components/TurnoutList/TurnoutList';
import TimeContext from '../../../../context/timeContext';
import styles from './styles.module.scss';

const Turnout: FC = () => {
  const {
    time: { hours },
  } = useContext(TimeContext);

  const showHour = () => {
    if (hours >= 12 && hours < 15) return '12';
    if (hours >= 15 && hours < 18) return '15';
    if (hours >= 18 && hours < 21) return '18';
  };

  return (
    <div className={styles['turnout']}>
      <h2 className={styles['turnout__header']}>
        Явка на&nbsp;<span className={styles['clock']}>{showHour()}:00</span>
      </h2>
      <TurnoutList className={styles['turnout__list']} />
    </div>
  );
};

export default Turnout;
