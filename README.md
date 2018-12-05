# Immutable Transform Memoizer
A utility function for reusing results of transformations over Immutable.js
collections.

This library is intended for use in apps that need to propagate small changes
through large Immutable Collections without wasting time and memory redoing
work on objects that have not changed. It can make frequent .toJS operations
significantly faster by avoiding re-traversal of nested Collections.

## Usage

Here's an example of our primary use case - we want to convert a massive
Immutable.js Map into an array. Not an ideal pattern, but it's a pattern that
we have in one of our Reselect selectors.

```javascript
import { Map } from "immutable";
import memoizeImmutableTransform from "immutable-transform-memoizer";
const memoizedToJS = memoizeImmutableTransform(value => value.toJS(), "array");
const yourMap = Map({
  fizz: Map({ "beep": "boop" }),
  buzz: Map({ "car": "cdr" })
});
const yourArray = memoizedToJS(yourMap);
```
