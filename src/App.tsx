import * as React from 'react';
import { Provider } from 'react-redux'

import ChartContainer from './Containers/ChartContainer'
import store from './store/store'

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Provider store={store}>
          <ChartContainer />
        </Provider>
      </div>
    );
  }
}

export default App;
