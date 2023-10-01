import classNames from 'classnames';
import { FC } from 'react';

import { ICandidate } from '../../models/ICandidate';
import PhotoItem from './PhotoItem/PhotoItem';
import styles from './styles.module.scss';

interface PhotosListProps {
  className?: string;
  candidates: Array<ICandidate>;
}

const PhotosList: FC<PhotosListProps> = ({ className, candidates }) => {
  return (
    <div
      className={classNames(
        styles['photo-list'],
        candidates.length === 0 ? styles['photo-list_empty'] : null,
        className ? className : null,
      )}>
      {candidates.length === 0 ? (
        <div className={styles['photo-list__error']}>
          <span className={styles['error-text']}>Список кандидатов пуст</span>
        </div>
      ) : (
        candidates.map((item) => <PhotoItem key={item.candidate_id} candidate={item} />)
      )}
    </div>
  );
};

export default PhotosList;
