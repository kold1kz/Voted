import React from 'react';

import Employee from '../pages/employee/Employee';
import Login from '../pages/login/Login';
import Main from '../pages/main/Main';

export interface IRoute {
  path?: string;
  component: React.ComponentType;
  exact?: boolean;
}

export enum RouteNames {
  MAIN_PAGE = '/',
  MAIN_PAGE_SCREENS = '/main',
  LOGIN_PAGE = '/login',
  EMPLOYEE_PAGE = '/employee-page',
}

export const publicRoutes: IRoute[] = [
  {
    path: RouteNames.MAIN_PAGE,
    exact: true,
    component: Main,
  },
  {
    path: RouteNames.MAIN_PAGE_SCREENS,
    component: Main,
  },
  {
    path: RouteNames.LOGIN_PAGE,
    component: Login,
  },
];

export const privateRoutes: IRoute[] = [
  {
    path: RouteNames.EMPLOYEE_PAGE,
    component: Employee,
  },
];
