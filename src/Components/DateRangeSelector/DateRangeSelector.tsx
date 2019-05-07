import * as React from 'react'

import './DateRangeSelector.css'

interface IDateRangeSelectorProps {
  handleClick: (dateRange: number) => void
}

interface IDateRangeSelectorState {
  selectedBtn: number
}

class DateRangeSelector extends React.Component<IDateRangeSelectorProps, IDateRangeSelectorState> {
  constructor(props: IDateRangeSelectorProps) {
    super(props)
    this.state = {
      selectedBtn: 1
    }
  }

  public render() {
    return (
      <div className="date-range-container">
        {this.renderButtons([1, 3, 6, 12])}
      </div>
    )
  }

  private renderButtons = (btnsToRender: number[]) => {
    return btnsToRender.map((num: number) => {
      const className = this.getClassName(num)
      return (
        <button
          key={num}
          className={`${className}`}
          onClick={() => this.handleClick(num, num)}>
          {`${num} Months`}
        </button>
      )
    })
  }

  private getClassName = (num: number): string => {
    const { selectedBtn } = this.state
    if (selectedBtn === num) {
      return 'active-btn'
    } else {
      return ''
    }
  }

  private handleClick = (dateRange: number, btnSelected: number) => {
    this.setState({
      selectedBtn: btnSelected
    }, () => {
      this.props.handleClick(dateRange)
    })
  }
}

export default DateRangeSelector
