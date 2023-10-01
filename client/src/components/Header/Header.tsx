import classNames from 'classnames';
import { FC, memo } from 'react';

import HeaderLogoSvg from '../../img/header-logo.svg';
import ClockTime from './ClockTime';
import styles from './styles.module.scss';

interface HeaderProps {
  isHideClocks?: boolean;
  className?: string;
}

const Header: FC<HeaderProps> = memo(function Header({
  isHideClocks = false,
  className,
}) {
  return (
    <header className={classNames(styles['header'], className ? className : null)}>
      <p
        className={classNames(
          styles['header__clock'],
          isHideClocks ? styles['header__clock_hidden'] : null,
        )}>
        <ClockTime />
      </p>
      <img
        src={HeaderLogoSvg}
        alt="Выборы мэра Москвы лого"
        className={styles['header__logo']}
      />
    </header>
  );
});

export default Header;
