import * as moment from 'moment'
import * as React from 'react'
import { DatePicker } from 'antd'
import { RangePickerValue } from 'antd/lib/date-picker/interface';

interface IDatePickerComponentProps {
  onChange: (fromDate: moment.Moment | undefined, toDate: moment.Moment | undefined) => void
}

interface IDatePickerComponentState {
  startDate: object,
  endDate: object
}

class DatePickerComponent extends React.Component<IDatePickerComponentProps, IDatePickerComponentState> {
  public state = {
    startDate: moment(),
    endDate: moment()
  }

  public render() {
    const { RangePicker } = DatePicker
    return (
      <RangePicker onChange={this.handleChange} />
    )
  }

  private handleChange = (dates: RangePickerValue, dateStrings: [string, string]): void => {
    if (dates[0] !== undefined && dates[1] !== undefined) {
      this.props.onChange(dates[0], dates[1])
    }
  }
}

export default DatePickerComponent
