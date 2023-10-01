import { FC } from 'react';
import { Route, Switch } from 'react-router';

import NotFound from '../pages/notFound/NotFound';
import { privateRoutes, publicRoutes } from '../routes';

const AppRouter: FC = () => {
  return (
    <Switch>
      {publicRoutes.map((route) => (
        <Route
          path={route.path}
          exact={route.exact}
          component={route.component}
          key={route.path}
        />
      ))}
      {privateRoutes.map((route) => (
        <Route
          path={route.path}
          exact={route.exact}
          component={route.component}
          key={route.path}
        />
      ))}
      <Route component={NotFound} />
    </Switch>
  );
};

export default AppRouter;
