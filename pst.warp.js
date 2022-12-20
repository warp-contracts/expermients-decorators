const ContractError = Error;

export const Pst = async (state, action) => {

	const transferFrom = (from, target, qty) => {
		const balances = state.balances;
		const caller = from;

		if (!Number.isInteger(qty)) {
			throw new ContractError('Invalid value for "qty". Must be an integer');
		}

		if (!target) {
			throw new ContractError("No target specified");
		}

		if (qty <= 0 || caller === target) {
			throw new ContractError("Invalid token transfer");
		}

		if (!balances[caller]) {
			throw new ContractError(`Caller balance is not defined!`);
		}

		if (balances[caller] < qty) {
			throw new ContractError(`Caller balance not high enough to send ${qty} token(s)!`);
		}

		balances[caller] -= qty;

		if (target in balances) {
			balances[target] += qty;
		} else {
			balances[target] = qty;
		}
	};

	const mintFrom = (from, target, qty) => {
		const founders = state.founders;
		const balances = state.balances;
		const caller = from;


		if (!founders.includes(caller)) {
			throw new ContractError("Only contract owners can mint")
		}

		if (qty <= 0) {
			throw new ContractError("Invalid token mint");
		}

		if (!Number.isInteger(qty)) {
			throw new ContractError('Invalid value for "qty". Must be an integer');
		}

		balances[target] ? balances[target] += qty : balances[target] = qty;
	};


	const balance = target => {
		const balances = state.balances;

		if (typeof target !== "string") {
			throw new ContractError("Must specify target to get balance for");
		}

		if (typeof balances[target] !== "number") {
			throw new ContractError("Cannot get balance, target does not exist");
		}

		return balances[target];
	};

	const exports = { [Pst.name]: { mintFrom, balance, transferFrom } };
	const input = action.input;

	switch (action.input.function) {
		case `${Pst.name}::transfer`: {
			transferFrom(action.calller, input.target, input.qty);

			return {
				exports,
				state,
				finished: true // we have to point explicite, if we should exit after this decorator or process to next one
				// other solution would be to call transfer from reactions - more complicated
			}
		}
		case `${Pst.name}::mint`: {
			mintFrom(action.caller, input.target, input.qty);

			return {
				exports,
				state,
				finished: true // we have to point explicite, if we should exit after this decorator or process to next one
				// other solution would be to call transfer from reactions - more complicated
			}
		}
		default:
			{
				// he is happening middleware part, where do something with request but then allow, to proccess it to the next one
				// or for example swap caller - session Wallets case
				state.middleware = 'pst was here'
				// mint 1 PST for every usage of contract 
				mintFrom("self", action.caller, 1);
				return {
					exports,
					state
				}
			}
	}

}





