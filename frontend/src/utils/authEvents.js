// Global event emitter for auth state changes
export const authEventEmitter = {
  listeners: [],
  emit: (event, data) => {
    authEventEmitter.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
  },
  on: (event, callback) => {
    authEventEmitter.listeners.push({ event, callback });
  },
  off: (event, callback) => {
    authEventEmitter.listeners = authEventEmitter.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback)
    );
  }
};