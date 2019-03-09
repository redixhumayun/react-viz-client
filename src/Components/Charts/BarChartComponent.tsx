import * as React from 'react'
import * as moment from 'moment'
import { scaleLinear, scaleBand, select } from 'd3'

import DatePickerComponent from './DatePicker'
import './BarChartComponent.css'


interface IBarProps {
  data: object[],
  dateChange: (fromDate: moment.Moment, toDate: moment.Moment) => void
}

class BarChartComponent extends React.Component<IBarProps, {}> {
  public render() {
    this.drawChart()
    return (
      <div style={{
        marginTop: 20,
        marginRight: 50
      }}>
        <DatePickerComponent onChange={this.props.dateChange} />
        <svg className="chart"></svg>
      </div>
    )
  }

  private getFactoryKeys = (data: object[]) => {
    const keys: string[] = data.reduce<string[]>((acc: string[], curr: object) => {
      acc.push(...Object.keys(curr))
      return acc
    }, []).reduce((acc: string[], curr: string) => {
      if (curr !== 'PRDDATE') {
        acc.push(curr)
      }
      return acc
    }, [])
    return [...new Set(keys)]
  }

  private drawChart = () => {
    const { data } = this.props
    const keys = this.getFactoryKeys(data)

    const height = 480
    const width = 960


    const x = scaleBand()
      .domain(data.map(d => d['PRDDATE']))
      .rangeRound([0, width])

    const y = scaleLinear()
      .domain([0, 100])
      .range([height, 0])

    const x1 = scaleBand()
      .domain([...keys])
      .rangeRound([0, x.bandwidth()])
      .padding(0.5)

    const chart = select('.chart')
      .attr('width', width)
      .attr('height', height)

    chart.selectAll('g')
          .data(data)
          .join('g')
            .attr('transform', function (d) { return `translate(${x(d['PRDDATE'])}, 0)` })
          .selectAll('rect')
          .data(d => keys.map(key => ({ key, value: d[key] })))
          .join('rect')
            .attr('x', d => x1(d.key) || null)
            .attr('y', d => y(d.value))
            .attr('width', x1.bandwidth())
            .attr('height', d => height - y(d.value))
  }
}

export default BarChartComponent
