const isRelative = (specifier) => specifier.startsWith('./') || specifier.startsWith('../');

export async function resolve(specifier, context, defaultResolve) {
  try {
    return await defaultResolve(specifier, context, defaultResolve);
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && isRelative(specifier)) {
      return defaultResolve(`${specifier}.js`, context, defaultResolve);
    }
    throw error;
  }
}
