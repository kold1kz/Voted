import { FC } from 'react';

import PhotoExample from '../../../img/user.svg';
import { ICandidate } from '../../../models/ICandidate';
import styles from './styles.module.scss';

interface PhotoItemProps {
  candidate: ICandidate;
}

const PhotoItem: FC<PhotoItemProps> = (props) => {
  const { candidate, consigment, candidate_id, photo } = props.candidate;
  return (
    <div className={styles['photo-item']}>
      <img
        src={photo ? 'http://' + photo : PhotoExample}
        alt={`${candidate_id}_${candidate}`}
        className={styles['photo-item__img']}
      />
      <h2 className={styles['photo-item__surname']}>{candidate.split(' ')[0]}</h2>
      <p className={styles['photo-item__name']}>
        {' '}
        {candidate.split(' ').slice(-2).join(' ')}
      </p>
      <p className={styles['photo-item__consigment']}>
        {consigment === 'Самовыдвижение' ? consigment : `«${consigment}»`}
      </p>
    </div>
  );
};

export default PhotoItem;
