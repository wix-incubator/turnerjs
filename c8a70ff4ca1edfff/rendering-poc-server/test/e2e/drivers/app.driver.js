export class AppDriver {
  constructor(env) {
    this.env = env;
  }

  given = {};

  when = {
    navigate: (path = '/') => {
      browser.get(this.env.app.getUrl(path));
      return this;
    },
    increaseCounterValue: () => {
      this.get.incrementButton().click();
      return this;
    }
  };

  get = {
    incrementButton: () => $(`[data-hook="increment-button"]`),
    counter: () => $(`[data-hook="counter-value"]`)
  };
}
