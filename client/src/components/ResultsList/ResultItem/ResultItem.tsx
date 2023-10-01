import { FC, memo, useEffect, useState } from 'react';

import PhotoExample from '../../../img/user.svg';
import { ICandidateResult } from '../../../models/ICandidate';
import styles from './styles.module.scss';

interface ResultItemProps {
  result: ICandidateResult;
  isMobileScreen: boolean;
}

const ResultItem: FC<ResultItemProps> = memo(function ResultItem(props) {
  const [style, setStyle] = useState<any>(null);
  const {
    result: { candidate, result, photo },
    isMobileScreen,
  } = props;
  useEffect(() => {
    setTimeout(() => {
      if (isMobileScreen) {
        setStyle({
          width: `calc( 50% * ${result * 0.01} )`,
        });
      } else {
        setStyle({
          height: `calc( 17vh * ${result * 0.01} )`,
        });
      }
    }, 100);
  }, [result, isMobileScreen]);
  return (
    <div className={styles['result-item']}>
      <span className={styles['result-item__percent']}>{result}%</span>
      <div className={styles['result-item__graph']} style={style}></div>
      <div className={styles['result-item__candidate']}>
        <img
          src={photo ? 'http://' + photo : PhotoExample}
          alt={`фото ${candidate}`}
          className={styles['result-item__photo']}
        />
        <h2 className={styles['result-item__name']}>
          <span>{candidate.split(' ')[1]}</span>
          <span className={styles['result-item__name_uppercase']}>
            {candidate.split(' ')[0]}
          </span>
        </h2>
      </div>
    </div>
  );
});

export default ResultItem;
