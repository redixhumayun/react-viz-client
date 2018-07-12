import * as moment from 'moment'
import * as React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker-cssmodules.css';

interface IDatePickerComponentProps {
  onChange: (date: string, target: string) => void
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
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto'
        }}>
          <h2>From</h2>
          <DatePicker selected={this.state.startDate}
            onChange={(d, e) => this.handleChange(d, e, 'from')} />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto'
        }}>
          <h2>To</h2>
          <DatePicker selected={this.state.endDate}
            onChange={(d, e) => this.handleChange(d, e, 'to')} />
        </div>
      </div>
    )
  }

  private handleChange = (date: moment.Moment | null, event: React.SyntheticEvent<any> | undefined, target: string) => {
    if (target === 'to') {
      this.setState({
        endDate: date!
      })
    } else if (target === 'from') {
      this.setState({
        startDate: date!
      })
    }
    this.props.onChange(date!.format('YYYYMMDD'), target)
  }
}

export default DatePickerComponent
