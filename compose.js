export const compose = (...fns) => async (state, action) => {
  let imports = {};
  let hasAnyHandled = false;

  for (const fn of fns) {
    const result = await fn(state[fn.name], action, imports) || {};

    // gathering exports from all calls and passing to next one, "deriving" is always sequential - this can be blocker
    if (result.exports) {
      imports = { ...imports, ...result.exports }
    }

    // at leas one handler has to handle
    if (result.finished) {
      hasAnyHandled = true;
      break;
    }

    state = { ...state, [fn.name]: result.state };
  }

  if (!hasAnyHandled) {
    throw Error(`No handler found for ${action.input.function}`)
  }

  return { state, imports };
}
