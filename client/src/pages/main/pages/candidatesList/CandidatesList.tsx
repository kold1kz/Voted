import classNames from 'classnames';
import { FC, memo, useEffect, useState } from 'react';

import VotingService from '../../../../api/votingService';
import FormButton from '../../../../components/FormButton/FormButton';
import LoadingSpinner from '../../../../components/LoadingSpinner/LoadingSpinner';
import PhotosList from '../../../../components/PhotosList/PhotosList';
import { ICandidate } from '../../../../models/ICandidate';
import styles from './styles.module.scss';

const CandidatesList: FC = memo(function CandidatesList() {
  const [areasInfo, setAreasInfo] = useState({
    isOpenedCount: 0,
    peopleCount: 0,
  });
  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const beautyNumber = (value: number) => {
    return ('' + value)
      .split('')
      .reverse()
      .reduce((prev, current, index) => {
        return index % 3 === 0 && index !== 0
          ? '' + prev + ' ' + current
          : '' + prev + current;
      })
      .split('')
      .reverse()
      .join('');
  };
  const fetchInfo = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setTimeout(async () => {
        const result = (await VotingService.getCandidatesAndAreasInfo()).data;
        setAreasInfo({
          isOpenedCount: result.count_opened,
          peopleCount: result.count_people,
        });
        setCandidates(result.info);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div
      className={classNames(
        styles['candidates'],
        isError || isLoading ? styles['candidates_empty'] : null,
      )}>
      {isLoading ? (
        <LoadingSpinner className={styles['candidates__loader']} isPrimaryColor />
      ) : isError ? (
        <div className={styles['candidates__error']}>
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
          <div
            className={classNames(
              styles['candidates__voting-areas'],
              styles['voting-areas'],
            )}>
            <div className={styles['voting-areas__info-block']}>
              <span className={styles['voting-areas__name']}>Участков открыто</span>
              <div className={styles['voting-areas__value']}>
                {beautyNumber(areasInfo.isOpenedCount)}
              </div>
            </div>
            <div className={styles['voting-areas__info-block']}>
              <span className={styles['voting-areas__name']}>
                Число жителей на участках
              </span>
              <div className={styles['voting-areas__value']}>
                {beautyNumber(areasInfo.peopleCount)}
              </div>
            </div>
          </div>
          <PhotosList
            className={styles['candidates__candidates-list']}
            candidates={candidates}
          />
        </>
      )}
    </div>
  );
});

export default CandidatesList;
