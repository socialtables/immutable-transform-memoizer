import { Map, Set, List, Seq } from "immutable";
import { v4 as uuid } from "uuid";
import immutableTransformMemoizer from "./index";

test("do a basic transformation on a small Map", () => {
  const transform = immutableTransformMemoizer(value => value.get("v") * 2);
  const data = Map({
    a: Map({ v: 1 }),
    b: Map({ v: 2 })
  });
  const result = transform(data);
  expect(result.count()).toBe(2);
  expect(result.get("a")).toBe(2);
  expect(result.get("b")).toBe(4);
});

test("do a basic transformation on a small Set", () => {
  const transform = immutableTransformMemoizer(value => value.get("v") * 2);
  const data = Set([
    Map({ v: 1 }),
    Map({ v: 2 })
  ]);
  const result = transform(data);
  expect(result.count()).toBe(2);
  expect(result.has(2)).toBe(true);
  expect(result.has(4)).toBe(true);
});

test("do a basic transformation on a small List", () => {
  const transform = immutableTransformMemoizer(value => value.get("v") * 2);
  const data = List([
    Map({ v: 1 }),
    Map({ v: 2 })
  ]);
  const result = transform(data);
  expect(result.count()).toBe(2);
  expect(result.get(0)).toBe(2);
  expect(result.get(1)).toBe(4);
});

test("transform a Map to an Array", () => {
  const transform = immutableTransformMemoizer(
    value => value.get("val") * 2,
    "array"
  );
  const data = Map({
    a: Map({ val: 1 }),
    b: Map({ val: 2 })
  });
  const result = transform(data);
  expect(Array.isArray(result)).toBe(true);
  expect(result[0]).toBe(2);
  expect(result[1]).toBe(4);
});

test("transform a Map to an Object", () => {
  const transform = immutableTransformMemoizer(
    value => value.get("val") * 2,
    "object"
  );
  const data = Map({
    a: Map({ val: 1 }),
    b: Map({ val: 2 })
  });
  const result = transform(data);
  expect(result.a).toBe(2);
  expect(result.b).toBe(4);
});

test("transform a Map to a List", () => {
  const transform = immutableTransformMemoizer(
    value => value.get("val") * 2,
    "list"
  );
  const data = Map({
    a: Map({ val: 1 }),
    b: Map({ val: 2 })
  });
  const result = transform(data);
  expect(List.isList(result)).toBe(true);
  expect(result.get(0)).toBe(2);
  expect(result.get(1)).toBe(4);
});

test("transform a Set to a Map", () => {
  const transform = immutableTransformMemoizer(
    value => value.get("val") * 2,
    "map"
  );
  const a = Map({ val: 1 });
  const b = Map({ val: 2 });
  const data = Set([a, b]);
  const result = transform(data);
  expect(Map.isMap(result)).toBe(true);
  expect(result.get(a)).toBe(2);
  expect(result.get(b)).toBe(4);
});

test("transform a Set to a Seq", () => {
  const transform = immutableTransformMemoizer(
    value => value.get("val") * 2,
    "seq"
  );
  const a = Map({ val: 1 });
  const b = Map({ val: 2 });
  const data = Set([a, b]);
  const result = transform(data);
  expect(Seq.isSeq(result)).toBe(true);
  const arrResult = result.toArray();
  arrResult.sort();
  expect(arrResult.length).toBe(2);
  expect(arrResult[0]).toBe(2);
  expect(arrResult[1]).toBe(4);
});

test("speed up .toJS calls by reusing full result objects", () => {
  const largeObj = {};
  for (let i = 0; i < 5000; i++) {
    const id = uuid();
    largeObj[id] = Map({ id, [uuid()]: uuid() });
  }
  const largeMap = Map(largeObj);

  const slowTransform = v => v.toJS();
  const fastTransform = immutableTransformMemoizer(
    v => v.toJS(),
    "object"
  );

  const slowResults = [];
  const fastResults = [];
  let totalSlowTransformTime = 0;
  let totalFastTransformTime = 0;

  for (let i = 0; i < 5; i++) {
    let now = new Date();
    let then = now;
    slowResults.push(slowTransform(largeMap));
    now = new Date();
    totalSlowTransformTime += now.getTime() - then.getTime();
    then = now;
    fastResults.push(fastTransform(largeMap));
    now = new Date();
    totalFastTransformTime += now.getTime() - then.getTime();
  }

  expect(totalSlowTransformTime).toBeGreaterThan(0);
  expect(totalSlowTransformTime).toBeGreaterThan(totalFastTransformTime);

  expect(slowResults[0]).not.toBe(slowResults[1]);
  expect(fastResults[0]).toBe(fastResults[1]);
});

test("speed up .toJS calls by reusing nested result objects", () => {
  const largeObj = {};
  for (let i = 0; i < 5000; i++) {
    const id = uuid();
    largeObj[id] = Map({ id, [uuid()]: uuid() });
  }
  const slowTransform = v => v.toJS();
  const fastTransform = immutableTransformMemoizer(
    v => v.toJS(),
    "object"
  );

  const slowResults = [];
  const fastResults = [];
  let totalSlowTransformTime = 0;
  let totalFastTransformTime = 0;

  for (let i = 0; i < 5; i++) {
    // permutate the map by one key each cycle
    const largeMap = Map({ ...largeObj, [uuid()]: Map() });
    let now = new Date();
    let then = now;
    slowResults.push(slowTransform(largeMap));
    now = new Date();
    totalSlowTransformTime += now.getTime() - then.getTime();
    then = now;
    fastResults.push(fastTransform(largeMap));
    now = new Date();
    totalFastTransformTime += now.getTime() - then.getTime();
  }

  expect(totalSlowTransformTime).toBeGreaterThan(0);
  expect(totalSlowTransformTime).toBeGreaterThan(totalFastTransformTime);

  Object.keys(largeObj).forEach(key => {
    expect(slowResults[0][key]).not.toBe(slowResults[1][key]);
    expect(fastResults[0][key]).toBe(fastResults[1][key]);
  });
});
