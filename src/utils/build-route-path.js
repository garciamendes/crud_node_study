export function buildRoutePath(path) {
  const routeParamentersRegex = /:([a-zA-Z]*)/g
  const pathWhitParams = path.replaceAll(routeParamentersRegex, '(?<id>[a-z0-9\-_]*)')
  const pathRegex = new RegExp(`^${pathWhitParams}(?<query>\\?(.*))?$`)

  return pathRegex
}