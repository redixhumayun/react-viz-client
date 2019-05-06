import * as React from 'react'
import * as moment from 'moment'
import { axisBottom, axisLeft, scaleLinear, scaleTime, timeFormat, select, line, mouse, bisector, ContainerElement, curveMonotoneX } from 'd3'

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
        <svg className="chart" />
      </div>
    )
  }

  public componentDidMount() {
    if (this.props.data.length > 0) {
      this.drawChart()
    }
  }

  public componentDidUpdate() {
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
    const height = 480
    const width = 960
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

    //  Define the tooltip
    const tooltip = chart.append('g')
                        .attr('class', 'tooltip')

    //  Define the function for the tooltip
    const callout = (g: any, value: string) => {
      if (!value) {
        return g.style("display", "none")
      }

      g
        .style("display", null)
        .style("pointer-events", "none")
        .style("font", "10px sans-serif");

      const path = g.selectAll("path")
        .data([null])
        .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");

      const text = g.selectAll("text")
        .data([null])
        .join("text")
        .call((t: any) => t
        .selectAll("tspan")
        .data((value + "").split(/\n/))
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d: any, i: any) => `${i * 1.1}em`)
        .text((d: any) => d));

      const { x, y, width: w, height: h } = text.node().getBBox();

      text.attr("transform", `translate(${-w / 2},${15 - y})`);
      path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }

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
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr('d', dataLine)

    //  Add the circles at each node
    chart.selectAll('dot')
          .data(data)
          .join('circle')
          .attr('r', 2.5)
          .attr('cx', (d) => xScale(moment(d.PRDDATE).toDate()))
          .attr('cy', (d) => yScale(d.EFF))
          .on('click', (e: IDataShape) => {
            const { PRDDATE } = e
            this.props.fetchSingleDataPoint(PRDDATE)
          })

    //  Add a mousemove event to the chart to display the tooltip
    chart.on('mousemove', function (this: ContainerElement) {
      const coordinates = mouse(this)
      const { PRDDATE, EFF } = bisectorFn(coordinates[0])

      //  only transform the tooltip if both PRDDATE and EFF are not null
      if (PRDDATE && EFF) {
        tooltip.attr('transform', `translate(${xScale(PRDDATE)}, ${yScale(EFF)})`)
        .call(callout, `${EFF}% \n ${PRDDATE.toDateString()}`)
      }
    })

    //  Add a mouseleave event to remove the tooltip
    chart.on('mouseleave', function() {
      tooltip.call(callout, null)
    })


    //  Append the axes on to the chart
    chart.append('g')
      .call(xAxis)
    chart.append('g')
      .call(yAxis)
  }
}

export default LineChartComponent
