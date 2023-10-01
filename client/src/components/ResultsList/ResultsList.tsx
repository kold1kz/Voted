import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';

import useWindowDimensions from '../../hooks/useWindowDimensions';
import { ICandidateResult } from '../../models/ICandidate';
import ResultItem from './ResultItem/ResultItem';
import styles from './styles.module.scss';
interface PhotosListProps {
  className?: string;
  candidates: Array<ICandidateResult>;
}

const ResultsList: FC<PhotosListProps> = ({ className, candidates }) => {
  const [isMobileScreen, setMobileScreen] = useState(
    document.documentElement.clientWidth <= 1024,
  );
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (width <= 1300 && !isMobileScreen) {
      setMobileScreen(true);
    } else if (width > 1300 && isMobileScreen) {
      setMobileScreen(false);
    }
  }, [width]);

  return (
    <div className={classNames(styles['results-list'], className ? className : null)}>
      {candidates
        .sort((a, b) => {
          if (a.result > b.result) {
            return -1;
          }
          if (a.result < b.result) {
            return 1;
          }
          return 0;
        })
        .map((item) => (
          <ResultItem
            key={item.candidate_id}
            result={item}
            isMobileScreen={isMobileScreen}
          />
        ))}
    </div>
  );
};

export default ResultsList;
