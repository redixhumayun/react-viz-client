import * as React from 'react';
import { Provider } from 'react-redux'

import ChartContainer from './Containers/ChartContainer'
import store from './store/store'
import './App.css'

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

  public componentDidMount() {
    document.body.style.background = '#F5F5FC'
  }
}

export default App;
