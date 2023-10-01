import classNames from 'classnames';
import { FC, useContext, useEffect, useState } from 'react';

import VotingService from '../../api/votingService';
import TimeContext from '../../context/timeContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import FormButton from '../FormButton/FormButton';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './styles.module.scss';
import TurnoutItem from './TurnoutItem/TurnoutItem';

interface TurnoutListProps {
  className?: string;
}

const TurnoutList: FC<TurnoutListProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [turnout, setTurnout] = useState<
    {
      district: string;
      turnout: number;
    }[]
  >([]);
  const [isMobileScreen, setMobileScreen] = useState(
    document.documentElement.clientWidth <= 768,
  );
  const { width } = useWindowDimensions();
  const {
    time: { minutes, hours },
  } = useContext(TimeContext);

  const fetchTurnout = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setTimeout(async () => {
        const result = (await VotingService.getDistrictsTurnout()).data;
        setTurnout(result.districts_turnout);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const fetchTurnoutSilent = async () => {
    try {
      const result = (await VotingService.getDistrictsTurnout()).data;
      setTurnout(result.districts_turnout);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTurnout();
  }, []);

  useEffect(() => {
    if ((hours === 15 && minutes === 0) || (hours === 18 && minutes === 0)) {
      fetchTurnoutSilent();
    }
  }, [minutes, hours]);

  useEffect(() => {
    if (width <= 768 && !isMobileScreen) {
      setMobileScreen(true);
    } else if (width > 768 && isMobileScreen) {
      setMobileScreen(false);
    }
  }, [width]);
  return (
    <div
      className={classNames(
        styles['turnout-list'],
        isError || isLoading || turnout.length === 0
          ? styles['turnout-list_empty']
          : null,
        className ? className : null,
      )}>
      {isLoading ? (
        <LoadingSpinner className={styles['turnout-list__loader']} isPrimaryColor />
      ) : isError || turnout.length === 0 ? (
        <div className={styles['turnout-list__error']}>
          {turnout.length === 0 ? (
            <span className={styles['error-text']}>Список пустой</span>
          ) : (
            <>
              <span className={styles['error-text']}>Произошла ошибка</span>
              <FormButton
                type="button"
                disabled={false}
                className={styles['error-btn']}
                onClick={fetchTurnout}>
                Попробовать ещё раз
              </FormButton>
            </>
          )}
        </div>
      ) : (
        turnout.map((item, index) => (
          <TurnoutItem key={index} turnoutInfo={item} isMobileScreen={isMobileScreen} />
        ))
      )}
    </div>
  );
};

export default TurnoutList;
