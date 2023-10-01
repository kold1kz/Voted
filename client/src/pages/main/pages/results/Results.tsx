import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';

import VotingService from '../../../../api/votingService';
import FormButton from '../../../../components/FormButton/FormButton';
import LoadingSpinner from '../../../../components/LoadingSpinner/LoadingSpinner';
import ResultsList from '../../../../components/ResultsList/ResultsList';
import useInterval from '../../../../hooks/useInterval';
import styles from './styles.module.scss';

const Results: FC = () => {
  const [votesInfo, setVotesInfo] = useState({
    turnout: 0,
    checked_bulletins: 0,
  });
  const [candidates, setCandidates] = useState<
    {
      candidate_id: number;
      candidate: string;
      result: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchInfo = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setTimeout(async () => {
        const result = (await VotingService.getResultsInfo()).data;
        setVotesInfo({
          turnout: result.turnout,
          checked_bulletins: result.checked_bulletins_percentage,
        });
        setCandidates(result.candidate_results);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const silentFetchInfo = async () => {
    try {
      const result = (await VotingService.getResultsInfo()).data;
      setVotesInfo({
        turnout: result.turnout,
        checked_bulletins: result.checked_bulletins_percentage,
      });
      setCandidates(result.candidate_results);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  useInterval(() => {
    silentFetchInfo();
  }, 15000);

  return (
    <div
      className={classNames(
        styles['results'],
        isError || isLoading ? styles['results_empty'] : null,
      )}>
      {isLoading ? (
        <LoadingSpinner className={styles['results__loader']} isPrimaryColor />
      ) : isError ? (
        <div className={styles['results__error']}>
          <span className={styles['error-text']}>Произошла ошибка</span>
          <FormButton
            type="button"
            disabled={false}
            className={styles['error-btn']}
            onClick={fetchInfo}>
            Попробовать ещё раз
          </FormButton>
        </div>
      ) : (
        <>
          <div className={styles['results__statistics']}>
            <p className={styles['info']}>
              Явка - <span className={styles['info__result']}>{votesInfo.turnout}%</span>
            </p>
            <p className={styles['info']}>
              Голосов обработано -{' '}
              <span className={styles['info__result']}>
                {votesInfo.checked_bulletins}%
              </span>
            </p>
          </div>
          <ResultsList className={styles['results__list']} candidates={candidates} />
        </>
      )}
    </div>
  );
};

export default Results;
