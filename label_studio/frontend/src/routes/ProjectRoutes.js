import React from 'react';
import { useRoutesMap } from '../providers/RoutesProvider';
import { resolveRoutes } from '../utils/routeHelpers';
import { RouteWithStaticFallback } from './RouteWithStaticFallback';

export const ProjectRoutes = ({ content }) => {
  // routes 是解析出来的路由，结构是对象形式的，暂时路由有 /projects 和 /organization
  const routes = useRoutesMap();
  // 将上面的 routes 转换成 react-router 的组件
  const resolvedRoutes = resolveRoutes(routes, { content });
  
  return resolvedRoutes ? (
    <RouteWithStaticFallback path="/" children={resolvedRoutes}/>
  ) : null;
};
