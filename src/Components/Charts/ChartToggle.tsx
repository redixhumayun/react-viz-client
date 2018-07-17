import * as React from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface ILoc {
  location: string,
  color: string
}

interface IChartToggleProps {
  locations: ILoc[],
  onChange: (option: ILoc, checked: boolean) => void
}

class ChartToggle extends React.Component<IChartToggleProps, {}> {
  public render() {
    return (
      this.props.locations.map((loc: ILoc) => (
        <Checkbox className={`${loc.location}`}
          value={loc}
          onChange={this.onChange}
          key={`button_${loc.location}`}>
          {loc.location}
        </Checkbox>
      ))
    )
  }

  private onChange = (e: CheckboxChangeEvent): void => {
    this.props.onChange(e.target.value, e.target.checked)
  }
}

export default ChartToggle
