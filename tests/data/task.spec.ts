import { Task, Signal } from '../../src/data';
import { noop } from '../../src/utils';
import { assert } from 'chai';


describe('Task', function() {
  describe('run', function() {
    it('should run the wrapped computation asyncronously', function(done) {
      var test = 0;
      const task = Task.create((sinks) => {
        test = 5;
        sinks.resolve(null);
      });

      task.run({
        reject: noop,
        resolve(val) {
          assert.equal(test, 5);
          done();
        },
        progress: noop
      });

      // Test should still be 0.
      assert.equal(test, 0);
    });
  });

  describe('sync', function() {
    it('should create a task that runs syncronously', function(done) {
      var test = 0;
      const task = Task.sync((sinks) => {
        test = 5;
        sinks.resolve(null);
      });

      task.run({
        reject: noop,
        resolve(val) {
          assert.equal(test, 5);
          done();
        },
        progress: noop
      });

      assert.equal(test, 5);
    });
  });

  describe('join', function() {
    it('should flatten nested Tasks', function(done) {
      const task = Task.create((sinks) => {
        sinks.resolve(Task.create((sinks) => {
          sinks.resolve(5);
        }));
      });

      task.join().run({
        reject : noop,
        resolve : (val) => {
          assert.equal(val, 5, 'correctly flattened Task');
          done();
        },
        progress : noop
      });
    });
  });

  describe('chain', function() {
    it('should map and flatten with Task-producing function', function(done) {
      const task = Task.create((sinks) => {
        sinks.resolve(5);
      });

      const mapping1 = (val: number) => {
        assert.equal(val, 5, 'incorrect first result');
        return Task.create((sinks) => {
          sinks.resolve(val + 1);
        });
      };

      const mapping2 = (val: number) => {
        assert.equal(val, 6, 'incorrect second result');
        return Task.create((sinks) => {
          sinks.resolve(val + 2);
        });
      };

      task.chain(mapping1).chain(mapping2).run({
        reject: noop,
        resolve(val: number) {
          assert.equal(val, 8, 'incorrect final result');
          done();
        },
        progress: noop
      });
    });
  });

  describe('map', function() {
    it('should map and flatten with Task-producing function', function(done) {
      const task = Task.create((sinks) => {
        sinks.resolve(5);
      });

      const mapping = (val: number): string => {
        return 'butcher';
      };

      task.map(mapping).run({
        reject: noop,
        resolve(val: string) {
          assert.equal(val, 'butcher');
          done();
        },
        progress: noop
      });
    });
  });

  describe('filter', function() {
    it('should turn resolve into reject for failed predicate', function(done) {
      const task = Task.create((sinks) => {
        sinks.resolve(5);
      });

      const predicate =
        (val: number): boolean => {
          return (val > 6);
        };

      task.filter(predicate).run({
        reject(val: number): void {
          assert.equal(val, null);
          done();
        },
        resolve(val: number): void {
          assert.ok(false, 'incorrectly resolved');
          done();
        },
        progress: noop
      });
    });
  });

  describe('filter', function() {
    it('should do nothing if predicate passes', function(done) {
      const task = Task.create((sinks) => {
        sinks.resolve(5);
      });

      const predicate =
        (val: number): boolean => {
          return (val < 6);
        };

      task.filter(predicate).run({
        reject(val: number): void {
          assert.ok(false, 'incorrectly rejected');
          done();
        },
        resolve(val: number): void {
          assert.equal(val, 5);
          done();
        },
        progress: noop
      });
    });
  });

  describe('recover', function() {
    it('should map a reject into a resolve', function(done) {
      const task = Task.create((sinks) => {
        sinks.reject(5);
      });

      const mapping =
        (val: number): string => {
          return 'butcher';
        };

      task.recover(mapping).run({
        reject: noop,
        resolve(val: string): void {
          assert.equal(val, 'butcher');
          done();
        },
        progress: noop
      });
    });
  });

  describe('progress', function() {
    it('should map a progress into a resolve', function(done) {
      var count = 0;
      const task = Task.create((sinks) => {
        function updateProgress() {
          if (count < 2) {
            sinks.progress(count);
            setTimeout(updateProgress, 10);

          } else {
            sinks.resolve(10);
          }

          count += 1;
        }

        updateProgress();
      });

      const mapping =
        (val: number): number => val + 2;

      task.progress(mapping).run({
        reject(val: any): void {
          assert.ok(false, 'reject called');
          done();
        },
        resolve(val: number): void {
          if (count === 0) {
            assert.equal(val, 2, 'incorrect first result');
          } else if (count === 1) {
            assert.equal(val, 3, 'incorrect second result');
          } else if (count === 2) {
            assert.equal(val, 10, 'incorrect final result');
            done();
          } else {
            assert.ok(false, 'match fall through');
            done();
          }
        },
        progress(val: number): void {
          assert.ok(false, 'progress mapping failed');
          done();
        }
      });
    });
  });

  describe('execute', function() {
    it('should execute a Signal of Tasks and push values to callback', function(done) {
      const tasks = Signal.create<Task<any,number,any>>();
      const toRun = Task.succeed<number>(5);
      const responses = Signal.create<number>();
      const expected = 5;

      responses.onNext((val: number): void => {
        assert.equal(val, expected);
        done();
      });

      Task.execute<number>(tasks, Signal.push(responses));

      Signal.push(tasks, toRun);
    });
  });

  describe('delay', function() {
    it('should create a Task that emits delayed value after time', function(done) {
      const task = Task.delay(1000, 'test value');

      task.run({
        reject: (err) => {
          assert.ok(false);
          done();
        },
        resolve: (val) => {
          assert.equal(val, 'test value');
          done();
        }
      });
    });
  });

  describe('succeed', function() {
    it('should create a Task that only succeeds', function(done) {
      const task = Task.succeed('test value');

      task.run({
        reject : (err) => {
          assert.ok(false, 'reject called');
          done();
        },
        resolve : (val) => {
          assert.equal(val, 'test value');
          done();
        }
      });
    });
  });

  describe('fail', function() {
    it('should create a Task that only fails', function(done) {
      const task = Task.fail('test error');

      task.run({
        reject : (err) => {
          assert.equal(err, 'test error');
          done();
        },
        resolve : (val) => {
          assert.ok(false, 'resolve called');
          done();
        }
      });
    });
  });

  describe('never', function() {
    it('should create a Task that never resolves', function(done) {
      const task = Task.never();

      task.run({
        reject : (err) => {
          assert.ok(false);
          done();
        },
        resolve : (val) => {
          assert.ok(false);
          done();
        },
        progress : (val) => {
          assert.ok(false);
          done();
        }
      });

      setTimeout(() => {
        assert.ok(true);
        done();
      }, 1000);
    });
  });

  describe('sequence', function() {
    it('should create a task that runs a list of tasks in sequence', function(done) {
      var test: number = 0;
      const task = Task.create((sinks) => {
        test = 5;
        sinks.resolve(null);
      });

      task.run({
        reject: noop,
        resolve(val) {
          assert.equal(test, 5);
          done();
        },
        progress: noop
      });

      // Test should still be 0.
      assert.equal(test, 0);
    });
  });

  describe('when', function() {
    it('should create a task that runs a list of tasks in parallel', function(done) {
      var counter: number = 0;

      const task = Task.when(
        Task.create((sinks) => {
          assert.equal(counter, 0);
          counter += 1;
          setTimeout(() => {
            sinks.resolve(1);
          }, 100);
        }),
        Task.create((sinks) => {
          assert.equal(counter, 1);
          counter += 1;
          setTimeout(() => {
            sinks.resolve(2);
          }, 50);
        }),
        Task.create((sinks) => {
          assert.equal(counter, 2);
          counter += 1;
          setTimeout(() => {
            sinks.resolve(3);
          }, 80);
        })
      );

      task.run({
        reject(err) {
          assert.ok(false, 'reject called');
          done();
        },
        resolve(val) {
          assert.equal(counter, 3);
          assert.deepEqual(val, [1,2,3]);
          done();
        }
      });
    });
  });
});