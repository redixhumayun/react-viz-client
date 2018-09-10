import * as React from 'react';
import './App.css';

// import LineChart from './Containers/Chart';
import BarChart from './Containers/BarChart'

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <BarChart />
      </div>
    );
  }
}

export default App;
