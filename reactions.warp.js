export const Reactions = async (state, action, imports) => {
	const like = async () => {
		// using exports
		const psts = imports.Pst.balance(action.caller);
		// isolated state
		state.likes = state.likes + psts;
		// calling transfer from pst decorator
		console.log(`${Reactions.name}::like`, state, action);
	}

	switch (action.input.function) {
		case `${Reactions.name}::like`:
			{
				await like();

				return { state, finished: true };
			}
		default `{}::tranfer`:
			thro
	}
}
