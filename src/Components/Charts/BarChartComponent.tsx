import * as React from 'react'
import * as moment from 'moment'
import { axisBottom, axisLeft, scaleLinear, scaleBand, select, event, easeLinear } from 'd3'

import './BarChartComponent.css'


interface IBarProps {
  data: object[],
  fetchSingleFactoryData: (date: string | Date, location: string) => Promise<void>
}

interface IDataShape {
  PRDDATE: string,
  EFF: number,
  LOCATION: string
}

class BarChartComponent extends React.Component<IBarProps, {}> {
  public render() {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg className="chart" />
      </div>
    )
  }

  public componentDidMount() {
    const { data } = this.props
    if (data.length > 0) {
      this.drawChart()
    }
  }

  public componentDidUpdate() {
    console.log("Component did update")
    this.drawChart()
  }

  private getFactoryKeys = (data: object[]): string[] => {
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

  private drawChart = (): void => {
    const { data } = this.props
    const keys = this.getFactoryKeys(data)

    //  Define all the dimensions required for showing the SVG
    const height = 480
    const width = 960
    const margin: { top: number, right: number, bottom: number, left: number } = { top: 30, right: 30, bottom: 30, left: 30 }

    //  Define the scales and the axes required
    const x = scaleBand()
      .domain(data.map((d: IDataShape) => d.PRDDATE))
      .rangeRound([0, width])

    const y = scaleLinear()
      .domain([0, 100])
      .range([height, 0])

    const x1 = scaleBand()
      .domain([...keys])
      .rangeRound([0, x.bandwidth()])
      .padding(0.5)

    const xAxis = (g: any) => g.attr('transform', `translate(${margin.left - 10}, ${height + margin.top})`)
      .call(axisBottom(x)
        .tickFormat(d => moment(d).format('MMMM DD, YYYY'))
      )

    const yAxis = (g: any) => g.attr('transform', `translate(${margin.left - 5}, ${margin.top})`)
      .call(axisLeft(y))

    //  Define the tooltip
    const tooltip = select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)

    //  Select the SVG element and give dimensions
    const chart = select('.chart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)


    //  Draw the actual chart with the required data
    chart.append('g')
      .selectAll('g')
      .data(data)
      .join('g')
      .attr('transform', function (d: IDataShape) { return `translate(${x(d.PRDDATE)! + margin.left - 10}, ${margin.top})` })
      .selectAll('rect')
      .data((d: IDataShape) => keys.map(key => ({ key, value: d[key], date: d.PRDDATE })))
      .join('rect')
      .attr('x', d => x1(d.key) || null)
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => height - y(d.value))
      .on('mouseover', d => {
        tooltip.transition()
          .duration(250)
          .ease(easeLinear)
          .style('opacity', 0.9)
        tooltip.html(d.key + "<br />" + d.value)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on('mouseout', d => {
        tooltip.transition()
          .duration(250)
          .ease(easeLinear)
          .style('opacity', 0)
      })
      .on('click', (d) => {
        this.props.fetchSingleFactoryData(d.date, d.key)
      })

    //  Append the axes on to the chart
    chart.append('g')
      .call(xAxis)
    chart.append('g')
      .call(yAxis)

  }
}

export default BarChartComponent
