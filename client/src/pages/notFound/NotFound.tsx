import { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { RouteNames } from '../../routes';
import styles from './styles.module.css';

const NotFound: FC = () => {
  return (
    <div className={styles['container']}>
      <p>Упс, страница не найдена</p>
      <NavLink className={styles['button']} to={RouteNames.MAIN_PAGE}>
        На главную
      </NavLink>
    </div>
  );
};

export default NotFound;
