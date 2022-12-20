import { Reactions } from './reactions.warp.js';
import { Pst } from './pst.warp.js';
import { compose } from './compose.js';

const INIT_STATE = {
  'Reactions': { likes: 0 },
  'Pst': { balances: {}, founders: ["founder1", "self"] }
};

const contractWithPst = compose(
  Pst,
  Reactions
);


async function main() {
  console.log("FIRST CALL")
  let result = await contractWithPst(INIT_STATE, { caller: "founder1", input: { function: 'Pst::mint', target: "self", qty: 1 } })
  console.log(`pst::transfer result: ${JSON.stringify(result)}`)

  console.log("SECOND CALL")
  result = await contractWithPst(result.state, { caller: "a", input: { function: 'Reactions::like' } })
  console.log(`reactions::like result: ${JSON.stringify(result)}`)

  console.log("THIRD CALL - unknown function");
  try {
    await contractWithPst(result.state, { input: { function: 'like' } })
  } catch (e) {
    console.error(e.message)
  }

};

main()

