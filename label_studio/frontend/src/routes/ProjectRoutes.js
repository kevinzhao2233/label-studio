import React from 'react';
import { useRoutesMap } from '../providers/RoutesProvider';
import { resolveRoutes } from '../utils/routeHelpers';
import { RouteWithStaticFallback } from './RouteWithStaticFallback';

export const ProjectRoutes = ({ content }) => {
  // routes 是固定定义的路由，/projects 和 /organization
  const routes = useRoutesMap();
  // 获取路由的组件
  const resolvedRoutes = resolveRoutes(routes, { content });
  
  return resolvedRoutes ? (
    <RouteWithStaticFallback path="/" children={resolvedRoutes}/>
  ) : null;
};
