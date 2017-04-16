# Frampton-Core

Frampton is a library to assist writing JavaScript in a functional manner. Frampton supplies an observable implementation (Frampton.Data.Signal). Frampton also provides a number of utilities for dealing with common JavaScript types in a more functional manner (Frampton.List, Frampton.Object).

Frampton is written in Typescript and I believe functional programming is a nicer experience when strongly typed.


## Frampton.Signal

A Signal is a value that changes over time. Signals provide methods to alter their values or to be alerted to the changing state of those values.

```
import * as Frampton from '@frampton/core';


const { Signal } = Frampton.Data;


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