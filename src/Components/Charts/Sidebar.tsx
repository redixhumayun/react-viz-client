import * as React from 'react'
import { Select } from 'antd'

class Sidebar extends React.Component {
  public render() {
    const Option = Select.Option
    return (
      <Select defaultValue="chart">
        <Option value="chart">Chart</Option>
        <Option value="table">Table</Option>
      </Select>
    )
  }
}

export default Sidebar
