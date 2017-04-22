import { app } from '../src/app';
import { Signal, Task, Effect } from '../src/data';
import { assert } from 'chai';


describe("app", function() {
  function initState(count: number) {
    return {
      count: count
    };
  }

  it('should create a functioning app', function(done) {
    const inputs: Signal<string> =
      Signal.create<string>();

    var count: number = 0;

    interface State {
      count: number;
    }

    function init(): [ State, Effect<string> ] {
      return [ initState(0), Task.never() ];
    }

    function update(msg: string, state: State): [ State, Effect<string> ] {
      assert.equal(msg, 'first', 'Message incorrect');
      assert.equal(state.count, 0, 'Initial state incorrect');

      switch(msg) {
        case 'first':
          count ++;
          const newState: State =
            initState(state.count + 1);

          return [ newState, Task.never() ];

        default:
          return [ state, Task.never() ];
      }
    }

    const model: Signal<State> =
      app<State,string>({
        init: init,
        update: update,
        inputs: [ inputs ]
      });

    model.onNext((current: State) => {
      const actual: number = current.count;
      const expected = 1;

      assert.equal(actual, expected);
      done();
    });

    inputs.push('first');
  });
});