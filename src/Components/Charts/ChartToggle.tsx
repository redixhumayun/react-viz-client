import * as React from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface IChartToggleProps {
  locations: string[],
  onChange: (option: string, checked: boolean) => void
}

class ChartToggle extends React.Component<IChartToggleProps, {}> {
  public render() {
    return (
      this.props.locations.map(location => (
        <Checkbox className={`${location}`}
          value={`${location}`}
          onChange={this.onChange}
          key={`button_${location}`}>
          {location}
        </Checkbox>
      ))
    )
  }

  private onChange = (e: CheckboxChangeEvent): void => {
    this.props.onChange(e.target.value, e.target.checked)
  }
}

export default ChartToggle
