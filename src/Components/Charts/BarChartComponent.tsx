import * as React from 'react'
import * as moment from 'moment'
import { axisBottom, axisLeft, scaleLinear, scaleBand, select, ContainerElement, mouse } from 'd3'

import './BarChartComponent.css'


interface IBarProps {
  detail: string,
  data: IDataShape[],
  fetchSingleFactoryData: (date: string | Date, location: string) => Promise<void>
  renderPrevChart: () => void
}

interface IDataShape {
  PRDDATE: Date,
  FACTORY?: string
}

class BarChartComponent extends React.Component<IBarProps, {}> {
  public render() {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '30px'
      }}>
        <div style={{ alignSelf: 'flex-start' }} onClick={this.props.renderPrevChart}>
          <svg className="back-arrow" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z" /></svg>
        </div>
        <div id="tooltip">
          <p id="eff_val" />
          <p id="fac_key" />
        </div>
        <svg className="chart" viewBox="0 0 800 600" />
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
    //  Remove all previous SVG graphics before drawing new ones
    select('.chart')
      .selectAll('g')
      .remove()

    select('.chart')
      .selectAll('rect')
      .remove()

    select('.chart')
      .select('.tooltip')
      .remove()

    select('.chart')
      .selectAll('text')
      .remove()

    this.drawChart()
  }

  private getFactoryKeys = (data: object[]): string[] => {
    const keys: string[] = data.reduce<string[]>((acc: string[], curr: object) => {
      acc.push(...Object.keys(curr))
      return acc
    }, []).reduce((acc: string[], curr: string) => {
      if (curr !== 'PRDDATE' && curr !== 'FACTORY') {
        acc.push(curr)
      }
      return acc
    }, [])
    return [...new Set(keys)]
  }

  private drawChart = (): void => {
    const { data, detail } = this.props
    const keys = this.getFactoryKeys(data)

    //  Define all the dimensions required for showing the SVG
    const height = 600
    const width = 800
    const margin: { top: number, right: number, bottom: number, left: number } = { top: 30, right: 60, bottom: 30, left: 60 }

    //  Define the scales and the axes required
    const x = scaleBand()
      .domain([...keys])
      .rangeRound([margin.left, width - margin.right])
      .padding(0.5)

    const y = scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top])

    const xAxis = (g: any) => g.attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(x))

    const yAxis = (g: any) => g.attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(y))

    //  Select the SVG element and give dimensions
    const chart = select('.chart')
      .attr('width', width)
      .attr('height', height)

    //  Draw the actual chart with the required data
    chart.append('g')
      .selectAll('g')
      .data(data)
      .join('g')
      .selectAll('rect')
      .data((d: IDataShape) => keys.map(key => ({ key, value: d[key], date: d.PRDDATE })))
      .join('rect')
      .attr('x', d => x(d.key) || null)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value) - margin.bottom)
      .on('mouseover', function(this: ContainerElement, d) {
        //  Get the coordinates of the mouseover point
        const coordinates = mouse(this)
        select("#tooltip")
          .style('left', coordinates[0] + 'px')
          .style('top', coordinates[1] + 'px')

        select("#tooltip")
          .transition()
          .duration(250)
          .style('opacity', 0.9)

        select("#eff_val")
          .text(`EFF: ${d.value}%`)

        //  Decide what text to render based on what information the
        //  bar chart is displaying
        if (detail === 'Factory') {
          select("#fac_key")
            .text(`FACTORY: ${d.key}`)
        } else  if (detail === 'Batch') {
          select("#fac_key")
          .text(`BATCH: ${d.key}`)
        }

        select(this)
          .transition()
          .duration(250)
          .style('fill', '#FA8500')
      })

      .on('mouseout', function() {
        select("#tooltip")
          .transition()
          .duration(250)
          .style('opacity', 0)

        select(this)
          .transition()
          .duration(250)
          .style('fill', '#0063FC')
      })

      .on('click', (d) => {
        this.props.fetchSingleFactoryData(d.date, d.key)
      })

    //  Append the axes on to the chart
    chart.append('g')
      .call(xAxis)
    chart.append('g')
      .call(yAxis)

    //  Add the svg text node for the chart title
    let text = ''
    if (detail === 'Factory') {
      text = `Efficiency For All Factories On ${moment(data[0].PRDDATE).format('MMMM DD, YY')}`
    } else if(detail === 'Batch') {
      text = `Efficiency For All Batches Of ${data[0].FACTORY} On ${moment(data[0].PRDDATE).format('MMMM DD, YY')}`
    }

    chart.append('text')
          .attr('x', width / 2)
          .attr('y', margin.top)
          .attr('text-anchor', 'middle')
          .style('font-size', '18px')
          .style('font-family', 'Futura')
          .style("text-decoration", "underline")
          .text(text)

  }
}

export default BarChartComponent
