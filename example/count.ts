export const state = {
	count: 1,
	name: "count",
	newKey: -1,
};
export const maps = {
	isOdd: ({ count }) => count % 2 !== 0,
	splitName: state => {
		return state.name.split("");
	},
	returnNameWhenCountIsOdd: state => {
		if (state.count % 2 !== 0) {
			return state.name;
		}
		return state.count;
	},
	count: state => ({count: state.count}),
	combine: state => ({ ...state }),
	showNewKey: state => !!state.newKey && state.newKey,
};
export const actions = {
	inc: state => {
		return {
			...state,
			count: state.count + 1
		};
	},
	addKey: state => ({...state, newKey: 1}),
	deleteKey: state => {
		const res = {...state};
		delete res.newKey;
		return res;
	},
	doNothing: state => state,
	asyncDoNothing: state => Promise.resolve(state),
	asInc: ({ count, ...rest }) => Promise.resolve({ count: count + 1, ...rest }),
	dec: ({ count, ...rest }) => {
		return { count: count - 1, ...rest };
	},
	changeName: (newName, state) => ({
		...state,
		name: newName,
	})
};

export default {
	state,
	maps,
	actions
};