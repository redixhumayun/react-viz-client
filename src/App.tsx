import * as React from 'react';
import './App.css';

// import Chart from './Containers/Chart';
import ChartAlt from './Containers/ChartAlt'

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <ChartAlt />
      </div>
    );
  }
}

export default App;
