import * as React from 'react'
import * as moment from 'moment'
import { axisBottom, axisLeft, scaleLinear, scaleBand, select } from 'd3'

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
      <div>
        <DatePickerComponent onChange={this.props.dateChange} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg className="chart"></svg>
        </div>
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

    const margin: { top: number, right: number, bottom: number, left: number } = { top: 30, right: 30, bottom: 30, left: 30 }

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

    const xAxis = (g: any) => g.attr('transform', `translate(0, ${height})`)
                        .call(axisBottom(x)
                              .tickFormat(d => moment(d).format('MMMM DD, YYYY'))
                          )

    const yAxis = (g: any) => g.attr('transform', `translate(${margin.left}, 0)`)
                          .call(axisLeft(y))

    const chart = select('.chart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

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

    chart.append('g')
          .call(xAxis)

    chart.append('g')
          .call(yAxis)
  }
}

export default BarChartComponent
