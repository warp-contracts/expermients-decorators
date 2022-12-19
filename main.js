const pst = async (state, action) => {
  const transfer = async () => {
    // isolated state
    state.balance = state.balance + 1;
    console.log(`${pst.name}::transfer`, state, action);
  }

  const getBalance = async () => {
    return state.balance || 0;
  }

  const exports = { [pst.name]: { transfer, getBalance } };

  switch (action.input.function) {
    case `${pst.name}::transfer`:
      {
        await transfer();

        return {
          exports,
          state,
          finished: true // we have to point explicite, if we should exit after this decorator or process to next one
          // other solution would be to call transfer from reactions - more complicated
        }
      }
    default:
      {
        // he is happening middleware part, where do something with request but then allow, to proccess it to the next one, or throw - SessionWallets case
        state.middleware = 'pst was here'
        return {
          exports,
          state
        }
      }
  }

}

const reactions = async (state, action, imports) => {
  const like = async () => {
    // isolated state
    state.likes = state.likes + 1;
    // calling transfer from pst decorator
    imports.pst.transfer();
    console.log(`${reactions.name}::like`, state, action);
  }

  switch (action.input.function) {
    case `${reactions.name}::like`:
      {
        await like();

        return { state, finished: true };
      }
  }
}

const compose = (...fns) => async (state, action) => {
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

const INIT_STATE = {
  'reactions': { likes: 0 },
  'pst': { balance: 0 }
};

(async function main() {
  const contractWithPst = compose(
    pst,
    reactions
  );

  console.log("FIRST CALL")
  let result = await contractWithPst(INIT_STATE, { input: { function: 'pst::transfer' } })
  console.log(`pst::transfer result: ${JSON.stringify(result)}`)

  console.log("SECOND CALL")
  result = await contractWithPst(result.state, { input: { function: 'reactions::like' } })
  console.log(`reactions::like result: ${JSON.stringify(result)}`)

  console.log("THIRD CALL - unknown function")
  try {
     await contractWithPst(result.state, { input: { function: 'like' } })
  } catch(e) {
    console.error(e.message)
  }
})()


