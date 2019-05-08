import * as React from 'react'

import './DateRangeSelector.css'

interface IDateRangeSelectorProps {
  handleClick: (dateRange: number) => void,
  dateRange: number
}

const DateRangeSelector = (props: IDateRangeSelectorProps) => {
  return (
    <div className="date-range-container">
      {renderButtons([1, 3, 6, 12], props.dateRange, props.handleClick)}
    </div>
  )
}

const renderButtons = (btnsToRender: number[], dateRange: number, handleClick: (dateRange: number) => void) => {
  return btnsToRender.map((num: number) => {
    const className = getClassName(num, dateRange)
    return (
      <button
        key={num}
        className={`${className}`}
        onClick={() => handleClick(num)}>
        {`${num} Months`}
      </button>
    )
  })
}

const getClassName = (num: number, dateRange: number): string => {
    if (num === dateRange) {
      return 'active-btn'
    } else {
      return ''
    }
}

export default DateRangeSelector
