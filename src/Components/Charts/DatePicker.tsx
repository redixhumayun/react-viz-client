import * as moment from 'moment'
import * as React from 'react'
import DatePicker from 'react-datepicker'

class DatePickerComponent extends React.Component {
  public render() {
    return (
      <div>
        <h2>From</h2>
        <DatePicker selected={moment()}
          onChange={this.handleChange} />
        <h2>To</h2>
        <DatePicker selected={moment()}
          onChange={this.handleChange} />
      </div>
    )
  }

  private handleChange = (date: moment.Moment, event: React.SyntheticEvent<any>) => {
    console.log(date, event)
  }
}

export default DatePickerComponent
