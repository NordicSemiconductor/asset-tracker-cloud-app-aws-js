export const toFixed = (n: number): string =>
	n.toFixed(2).replace(/(\.00)|(0)$/, '')
