import * as React from 'react';
import './App.css';

import Chart from './Containers/Chart';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Chart />
      </div>
    );
  }
}

export default App;
