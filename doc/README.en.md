# react-natural-store cook book


- [concept of design](./design.en.md)

#### compatibility
- support react 15.x, 16.x and anujs


#### STEP1. Create a store instance

**This step needs to be done before the component is rendered, because the component wrapped by the inject method depends on the instance of the store when rendering.**

```js
import { createStore} from 'react-natural-store'
const app = {
  state: {
    name: 'tom',
  },
  actions: {
  /*
  The returned value will be used as the new state.
    If the original state or undefined is returned,
    the page will not trigger an update.
  */
  changeName: newName => ({name: newName}),
  /*
    Support promise return value,
    the value returned by promise will be used as the new state,
    if the original state or undefined is returned,
    the page will not trigger the update.
  */
  asyncChangeName: newName => Promise.resolve({name: newName}),
  },
  /*
   The optional parameters,
   the maps obtained on the page,
   will be the return value of the function after the run.
  */
  maps: {
    nameSplit: state => state.name.split(''),
    addName: state => lastName => state.name + lastName,
  }
}

const otherModules = {
  //...
};
// create store instance
const store = createStore({app, ...otherModules}); 
export default store;


```

#### STEP2. Inject the store module into the component using the inject method

```jsx

const App = ({app, module1}) => {
  // Get the injected app module
  const {state, actions, maps} = app;
  /*
    the app module you got
    state: {
      name: 'tom'
    },
    actions: {
      changeName,
      asyncChangeName,
    },
    maps: {
      splitName: ['t', 'o', 'm'],
      addName: lastName => state.name + lastName,
    }
  */
  return (
    <input
      value={state.name} // State data in the app module
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};

// Inject the app module in the store.
export default Inject('app', 'module1', ...)(App);

```

#### - Lazy loading configuration

```js
/*
  module1.js content
  export {
    state: {
      count: 1,
    }
    actions: {
      inc: state => ({count: state.count + 1}),
    }
  }
*/
// Lazy loading module
const module1 = () => import('module1');

const otherLazyModules = {
  // module2: () => import('module2');
  // ...
};
// The second parameter is the lazy loading module.
const store = createStore({ app }, { module1, ...otherLazyModules }); // create store instance

// The latter usage is the same as before
```

#### - when loading the module, the configuration of the loading prompt component

```jsx
import { inject } from 'react-natural-store';
// Global configuration
inject.setLoadingComponent(() => <div>loading...</div>);

// Local configuration
inject('app')(App, () => <div>loading</div>);
```

#### - Use store outside of react

```js
// Import the previously created store instance
import store from 'my-store-instance';

/* 
  get app module. 
  Equivalent to the app module obtained in the react component.
  If you want to get a lazy loaded module,
  Then you have to make sure that the module is loaded at this time.
*/
const app = store.getModule('app');
/*
  If you are sure, lazy loading module, not loaded yet
  You can listen to the lazy load module and get it
*/
store.subscribe('lazyModuleName', () => {
  const lazyModule = store.getModule('lazyModuleName');
});
/*
  state: {
  name: 'tom'
  },
  actions: {
  changeName,
  asyncChangeName,
  },
  maps: {
  splitName: ['t', 'o', 'm'],
  addName: lastName => state.name + lastName,
  }
*/

/*
  When you update the state using the action method here，
  All components injected into the app module will be updated，
  And get the data in the latest app module，
  It is recommended not to abuse
*/
app.actions.changeName('jerry');

// listen module change
const unsubscribe = store.subscribe('app', () => {
  // Here you can get the latest app data
  store.getModule('app');
});

// cancel listen
unsubscribe();
```



#### - typescript support

```ts

import React from 'react';
import ReactDOM from 'react-dom';
import {inject, StoreModule} from 'react-natural-store'

type storeProps = {count: StoreModule, name: StoreModule};
type otherProps = {
  className: string,
  style: Object,
}

const App: React.FC<storeProps & otherProps> = (props) => {
  const {state, actions, maps} = props.count;
  return (
    <>
      <button onClick={() => actions.inc(state)}>+</button>
      <span>{state.count}</span>
      <button onClick={() => actions.dec(state)}>-</button>
    </>
  )
}

const IApp = inject<storeProps>('count', 'name')(App);

const app = (
  <IApp className='1' style={{}} />
);
ReactDOM.render(
  app,
  document.querySelector('#app')
);


```



#### - react-natural-store precautions for use

 - Since the low version does not support the react.forwardRef method, you cannot directly use ref to get the component instance of the package. You need to use the forwardedRef property to get it (using the same ref).

 - Tips in TypeScript may not be so friendly, such as
 ```ts

@inject<storeProps>('count', 'name')
class App extends React.Component {
	// ...
}

// This method of use will report an error, indicating that there is no forwardedRef attribute declaration in the App component.
<App forwardedRef={console.log} />

// The following usage methods will not give an error.
class _App extends React.Component {
	// ...
}
const App = @inject<storeProps>('count', 'name')(_App);
// correct
<App forwardedRef={console.log} />

 ```