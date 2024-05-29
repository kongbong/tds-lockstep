class Task {
  time: number;
  callback: Function;
  context: any;

  constructor(time: number, callback: Function, context: any) {
    this.time = time;
    this.callback = callback;
    this.context = context;
  }
}

export default class Timer {
  time: number = 0;
  tasks: Task[] = [];

  constructor(time: number) {
    this.time = time;
  }

  setTimer(delayMs: number, callback: Function, context: any) {
    this.insert(new Task(this.time+delayMs, callback, context));
  }

  insert(task: Task) {
    let i = this.tasks.length / 2;
    let left = 0;
    let right = this.tasks.length;
    while (left < right) {
      if (this.tasks[i].time < task.time) {
        left = i + 1;
      } else {
        right = i;
      }
      i = left + (right - left) / 2;
    }
    this.tasks.splice(i, 0, task);
  }

  update(dt: number) {
    this.time += dt;
    while (this.tasks.length > 0 && this.tasks[0].time < this.time) {
      const task = this.tasks.shift();
      if (task) {
        task.callback.call(task.context);
      }
    }
  }
}