var listeners = {};

export default {
    subscribe(eventName, listener){
        listeners[eventName] = listeners[eventName] || [];
        listeners[eventName].push(listener);

        listener.remove = () => {
            listeners[eventName] = listeners[eventName].filter(l => l !== listener);
        };

        return listener;
    },
    removeAllListeners(){
        listeners = {};
    },
    dispatch(eventName, ...args){
        if(listeners[eventName] && listeners[eventName].length) {
            listeners[eventName].forEach(callback => callback(...args))
        }
    }
}





