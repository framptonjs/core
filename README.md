# Frampton-Core

Frampton is a library to assist writing JavaScript in a functional manner. Frampton supplies an observable implementation (Frampton.Data.Signal). Frampton also provides a number of utilities for dealing with common JavaScript types in a more functional manner (Frampton.List, Frampton.Object).

Frampton is written in Typescript and I believe functional programming is a nicer experience when strongly typed.


## Frampton.Data

Frampton.Data module exposes a few abstract data types that make working functionally a little easier.


### Frampton.Data.Signal

A Signal is a value that changes over time. Signals provide methods to alter their values or to be alerted to the changing state of those values.

```
import { Signal } from '@frampton/core';


// create a new signal
const sig: Signal<number> =
  Signal.create<number>();


// create a signal with an initial value
const sig2: Signal<number> =
  Signal.create(5);


// Respond to values of the signal
// the onValue method will immediately log '5' and then log any updates
// to the signal
sig2.onValue((val: number): void => {
  console.log('value = ' + val);
});


// the onNext method will not log 5, it will wait for the next value and update
// on each value after.
sig2.onNext((val: number): void => {
  console.log('next = ' + val);
});


// the onChange method works like the value method except it filters out repeated
// values. It will log 5 and then wait for the next value on the signal that is
// not a 5.
sig2.onChange((val: number): void => {
  console.log('changes = ' + val);
});


// Push a new value onto a signal
Signal.push(sig2, 6);


// The push method is curried
const pushToSig: (val: number) => void =
  Signal.push(sig2);

pushToSig(6);


// Get the current value of a signal
sig2.get();


// Modify a signal

// All methods return new signals
// Filter values
const greaterThanFive: Signal<number> =
  sig2.filter((val) => val > 5);


// You can also compare the current value against the next to decide if you want
// the signal to update. How onChange is implemented
const changes: Signal<number> =
  sig2.filterPrevious((prevValue: number, nextValue: number): boolean => {
    return prevValue !== nextValue;
  });


// Map values
const plusOne: Signal<number> =
  sig2.map((val: number): number => val + 1);


// Filter with another signal.

// This signal will only continue if sig has a truthy value.
const conditionMet: Signal<number> =
  sig2.and(sig);

// This signal will only continue if sig has a falsy value.
const notCondition: Signal<number> =
  sig2.not(sig);


// When sig2 updates this signal will grab the value of sig
const replace: Signal<number> =
  sig2.sample(sig);


// Merge signals
const bothSignals: Signal<number> =
  sig2.merge(sig);


// Zip signals. The resulting signal's value will be a tuple of the current
// values of each of its parents'
const tupleSignal: Signal<[number,number]> =
  sig2.zip(sig);


// Reduce a signal with a function. Like Array.prototype.reduce
// This counts how many times sig2 is called
const counter: Signal<number> =
  sig2.fold((acc: number, next: number): number => {
    return acc + 1;
  }, 0);

```


### Frampton.Data.Result

A Result is used to represent values that can be the result of successful or failed computations. It is analogous to Either in some functional programming languages. Result has two subclasses, Success and Failure.

```
import { Result, Success, Failure } from '@frampton/core';


const success: Success<number> =
  Result.success(5);

const failure: Failure<number> =
  Result.failure(8);


// map successful values
const mapping = (val: number): number => val + 5;
const mappedSuccess: Success<number> =
  success.map(mapping); // -> 'Success(10)'

const mappedFailure: Failure<number> =
  failure.map(mapping); // -> 'Failure(8)'


// map failed values
const mapping = (val: number): number => val + 3;
const mappedSuccess: Success<number> =
  success.mapFailure(mapping); // -> 'Success(5)'

const mappedFailure: Failure<number> =
  failure.mapFailure(mapping); // -> 'Failure(11)'


// filter Successes. Successes become Failures if the fail the predicate.
// Failures are unaltered.
const predicate = (val) => val > 10;
const filteredSuccess: Result<number,number> =
  success.filter(predicate); // -> 'Failure(5)'

const filteredFailure: Failure<number> =
  failure.filter(predicate); // -> 'Failure(8)'


// Run a callback based on success or failure.
const onSuccess = (val) => val + 3;
const onFailure = (val) => val + 10;
const successResult: number =
  success.fork(onSuccess, onFailure); // -> 8

const failureResult: number =
  failure.fork(onSuccess, onFailure); // -> 18


// Create Result from function that may throw
const wrappedFn: Result<number,string> =
  Result.fromThrowable((num) => {
    if (num > 5) {
      return num;
    } else {
      throw new Error('Too small');
    }
  });

wrappedFn(10); // -> 'Success(10)'
wrappedFn(2); // -> 'Failure(Too small)'


// fromThrowable returns a curried function
const testValues: Result<number,string> =
  Result.fromThrowable((first, second) => {
    if (first > second) {
      throw new Error('Second too small');
    } else {
      return second;
    }
  });

const testSix = testValues(6);
testSix(8); // -> 'Success(8)';
testSix(2); // -> 'Failure(Second too small)'
```


### Frampton.Data.Maybe

A Maybe is used to represent a value that may be null or undefined. This gives you an interface for dealing with such values without having to constantly do null checks. It also specifies in the type that this is a value that may not exist.

In Frampton Maybes are an interface that is implemented by Just and Nothing. Here we're using Haskell naming conventions. A Just represents a value and a Nothing is a missing value.

```
import { Maybe } from '@frampton/core';


const maybeOne: Maybe<number> =
  Maybe.create(1); // -> 'Just(1)'

const maybeNothing: Maybe<number> =
  Maybe.create(null); // -> 'Nothing'


// change the value of a Maybe
const mapping = (val) => val + 2;
const updatedOne = maybeOne.map(mapping); // -> 'Just(3)'
const updatedNothing = maybeNothing.map(mapping); // 'Nothing'


// filter the value of a Maybe
const predicate = (val) => val > 2;
const filteredOne = maybeOne.filter(predicate); // -> 'Nothing'
const filteredUpdatedOne = updatedOne.filter(predicate); // -> 'Just(3)'
const filteredNothing = updatedNothing.filter(predicate); // -> 'Nothing'


// flatten a nested Maybe
const nested = Maybe.create(Mabye.create(5)); // -> 'Just(Just(5))'
cosnt flattened = nested.join(); // -> 'Just(5)'


// join only removes one level of nesting
const doubleNested = Maybe.create(Maybe.create(Mabye.create(5))); // -> 'Just(Just(Just(5)))'
cosnt doubleFlattened = doubleNested.join(); // -> 'Just(Just(5))'


// get the value from a Maybe
const one = maybeOne.get(); // -> 1
const nothing = maybeNothing.get(); // -> Error: can't get value of Nothing


// safely get the value of a Maybe
const safeOne: number =
  maybeOne.getOrElse(5); // -> 1

const safeNothing: number =
  maybeNothing.getOrElse(5); // -> 5
```


### Frampton.Data.Task

A Task is essentially an IO monad. Use it to wrap IO operations that may fail. Tasks are particularly good for wrapping async operations. Much like promises.

Tasks are lazy. A task can be described without being run.

```
import { Task } from '@frampton/core';


// A Task takes a function to run. When the function is run it will receive
// an object with callbacks for different events in the life of the task.
// A Task has three type parameters, one for error, success and progress.
const waitTwoSeconds: Task<Error,string,never> =
  Task((sinks) => {
    setTimeout(() => {
      sinks.resolve('2 seconds passes');
    }, 2000);
  });


// The above just describes the task. To run it...
waitTwoSeconds.run({
  resolve(msg: string): void {
    console.log(msg);
  },
  reject(err: Error): void {
    console.log('err: ', err);
  }
});


// To filter the results of a task (a resolve becomes a reject)
const random: Task<number,number,never> =
  Task.create((sinks) => {
    sinks.resolve(Math.random() * 100);
  });

const randomOverFifty: Task<number,number,never> =
  random.filter((val) => val > 50);


// To map a result to another value...
// After 2 seconds emits a 5.
const delayedFive: Task<Error,number,never> =
  waitTwoSeconds.map(5);


// Map can also take a function
const delayedFunc: Task<Error,string,never> =
  waitTwoSeconds.map((msg: string): string => {
    return msg.toUpperCase();
  });


// To recover from an error. A reject becomes a resolve.
const httpGet =
  (url: string): Task<Error,any,never> =>
    Task.create((sinks) => {
      $.get(url).then((res) => {
        sinks.resolve(res);
      }, (err) => {
        sinks.reject(err);
      });
    });

const neverFailRequest: Task<never,any,never> =
  httpGet('http://fake.com/api/posts')
    .recover((err) => {
      // on failure return an empty array.
      return [];
    });


// Or, just supply a default value for failure
const neverFailRequest: Task<never,any,never> =
  httpGet('http://fake.com/api/posts').default([]);


// Run tasks in parallel...
Task.when(/* tasks to run */).run(...);


// Run tasks in sequence...
Task.sequence(/* tasks to run */).run(...);

```