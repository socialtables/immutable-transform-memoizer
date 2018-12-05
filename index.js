/* @flow strict */
import type { Collection } from "immutable";

/**
 * A handy memoizer for nested Immutable.js transformations - helps to avoid
 * expensive tree traversal and object re-creation during frequent .toJS calls
 */
export default function memoizeImmutableTransform (
	transformEntities: any => any,
	targetCollection?: "same" | "object" | "array" | "list" | "map" | "seq"
) {
	let preTransform = null;
	let postTransform = null;
	switch (targetCollection) {
		case "array":
			preTransform = v => v.valueSeq();
			postTransform = v => v.toArray();
			break;
		case "object":
			preTransform = v => v.toKeyedSeq();
			postTransform = v => v.toObject();
			break;
		case "list":
			preTransform = v => v.valueSeq();
			postTransform = v => v.toList();
			break;
		case "map":
			preTransform = v => v.toKeyedSeq();
			postTransform = v => v.toMap();
			break;
		case "seq":
			preTransform = v => v.toSeq();
			postTransform = v => v;
			break;
		case "same":
		default:
			preTransform = postTransform = v => v;
			break;
	}

	const cache = new WeakMap();

	function mapContents (valueObj) {
		if (valueObj === null || valueObj === undefined) {
			return valueObj;
		}
		const cached = cache.get(valueObj);
		if (cached) {
			return cached;
		}
		const transformedObj = transformEntities(valueObj);
		cache.set(valueObj, transformedObj);
		return transformedObj;
	}

	return function memoizedImmutableTransform (
		valueObj: Collection.Indexed<any> | Collection.Keyed<any, any>
	) {
		if (valueObj === null || valueObj === undefined) {
			return valueObj;
		}
		const cached = cache.get(valueObj);
		if (cached) {
			return cached;
		}
		const mappedValueObj = preTransform(valueObj).map(mapContents);
		const transformedObj = postTransform(mappedValueObj);
		cache.set(valueObj, transformedObj);
		return transformedObj;
	};
}
