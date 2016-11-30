import _ from 'lodash';

export default function stylesBuilder(styles) {
	let styleObject = {};

	for (let key in styles) {
		if (typeof(styles[key]) === 'object' && !Array.isArray(styles[key])) {
			
			Object.defineProperty(styleObject, key, {
				value: stylesBuilder(styles[key])
			});

		} else {
			styleObject[key] = styles[key];
		}
	}

	return styleObject;
}

export function transformStyles(styles) {
	const _styles = stylesBuilder(styles);

	return (path, params) => {
		const prop = _.get(_styles, path);
		return prop.get ? prop.get(params) : prop
	}
}