import * as React from 'react'
import * as moment from 'moment'
import { axisBottom, axisLeft, scaleLinear, scaleTime, timeFormat, select, line, mouse, bisector, ContainerElement, curveMonotoneX, selectAll } from 'd3'

import './LineChartComponent.css'

interface IDataShape {
  PRDDATE: string | Date,
  EFF: number
}

interface IBarProps {
  data: IDataShape[],
  fetchSingleDataPoint: (date: string | Date) => Promise<void>
}

class LineChartComponent extends React.Component<IBarProps, {}> {
  public render() {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div id="tooltip" className="hidden">
          <p>EFF: <span id="eff_val">100</span>%</p>
          <p>DATE: <span id="date_val"/></p>
        </div>
        <svg className="chart" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" />
      </div>
    )
  }

  //  This method is so that the chart area updates when a new date range is selected
  public componentDidUpdate() {
    //  Remove all previous SVG elements before rendering new chart
    select('.chart')
        .selectAll('g')
        .remove()

      select('.chart')
        .selectAll('path')
        .remove()

      select('.chart')
        .selectAll('circle')
        .remove()

    if (this.props.data.length > 0) {
      this.drawChart()
    }
  }

  //  This method is so that the chart area will re-render when the back button is hit from another chart
  public componentDidMount() {
    if (this.props.data.length > 0) {
      this.drawChart()
    }
  }

  public componentWillUnmount() {
    //  Remove all DOM nodes created under the .chart svg
    select('.chart')
        .selectAll('g')
        .remove()

    select('.chart')
        .selectAll('path')
        .remove()

    select('.chart')
        .selectAll('circle')
        .remove()
  }

  private drawChart = (): void => {
    const { data } = this.props

    //  Formate date from data for use in bisector function
    const dateFormattedData: any = data.reduce((acc: IDataShape[], currObj) => {
      const updatedObj = Object.assign(
        {},
        { ...currObj },
        { PRDDATE: moment(currObj.PRDDATE).toDate() }
      )
      acc.push(updatedObj)
      return acc
    }, [])

    //  Define the dates that will be used for the x domain
    const startDate = moment(data[0].PRDDATE).toDate()
    const endDate = moment(data[data.length - 1].PRDDATE).toDate()

    //  Define all the dimensions required for showing the SVG
    const height = 600
    const width = 800
    const margin: { top: number, right: number, bottom: number, left: number } = { top: 30, right: 60, bottom: 30, left: 60 }

    //  Define the scales and axes required
    const xScale = scaleTime()
      .domain([startDate, endDate])
      .rangeRound([margin.left, width - margin.right])

    const yScale = scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top])

    const xAxis = (g: any) => g.attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(xScale)
            .tickFormat(timeFormat('%b %d'))
      )

    const yAxis = (g: any) => g.attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(yScale))

    //  Define the bisector function to use for finding the position of the tooltip
    const bisectorFn = (value: number) => {
      const bisect = bisector((d: any) => d.PRDDATE).left
      const date = xScale.invert(value)
      const index = bisect(dateFormattedData, date)
      const a = dateFormattedData[index - 1]
      const b = dateFormattedData[index]
      try {
        return date.getTime() - a.PRDDATE.getTime() > date.getTime() - b.PRDDATE.getTime() ? a : b
      } catch (e) {
        console.log(e)
        return a || { PRDDATE: null, EFF: null }  //  return undefined || object
      }
    }

    //  Select the SVG element and give dimensions
    const chart = select('.chart')
      .attr('width', width)
      .attr('height', height)

    //  Define the line that is going to be shown
    const dataLine = line<IDataShape>()
      .x((d: IDataShape) => {
        return xScale(moment(d.PRDDATE).toDate())
      })
      .y((d: IDataShape) => {
        return yScale(d.EFF)
      })
      .curve(curveMonotoneX)

    //  Add the svg line onto the chart
    chart.append('path')
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#0063FC")
      .attr("stroke-width", 1.5)
      .attr('d', dataLine)

    //  Add the circles at each node
    chart.selectAll('dot')
          .data(data)
          .join('circle')
          .attr('r', 3)
          .attr('cx', (d) => xScale(moment(d.PRDDATE).toDate()))
          .attr('cy', (d) => yScale(d.EFF))
          .on('click', (e: IDataShape) => {
            const { PRDDATE } = e
            this.props.fetchSingleDataPoint(PRDDATE)
          })
          .on('mouseover', function(this: ContainerElement, d) {

            //  Get the coordinates for the mouse event
            //  Find the coordinates
            const coordinates = mouse(this)
            const { PRDDATE, EFF } = bisectorFn(coordinates[0])
            select('#tooltip')
              .style('left', coordinates[0] + 'px')
              .style('top', coordinates[1] - 75 + 'px')

            select("#eff_val")
              .text(EFF)
            select("#date_val")
              .text(PRDDATE.toDateString())

            select('#tooltip')
              .classed('hidden', false)

            select(this)
              .transition()
              .duration(250)
              .attr('r', 7.5)
          })
          .on('mouseout', function(d) {
            select('#tooltip')
              .classed('hidden', true)

            select(this)
              .transition()
              .duration(250)
              .attr('r', 3)
          })


    //  Append the axes on to the chart
    chart.append('g')
      .call(xAxis)
    chart.append('g')
      .call(yAxis)
  }
}

export default LineChartComponent
