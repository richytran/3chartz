import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import tipsData from './data/tips.csv';

function App() {
  const [selectedVariable, setSelectedVariable] = useState('total_bill');
  const [selectedCategory, setSelectedCategory] = useState('day');
  const [data, setData] = useState([]);

  useEffect(() => {
    // Parse and process the CSV data
    d3.csv(tipsData).then((data) => {
      setData(data);
    });
  }, []);

  return (
    <div>
      <Dropdown
        options={['total_bill', 'tip', 'size']}
        value={selectedVariable}
        onSelect={(value) => setSelectedVariable(value)}
      />
      <RadioButtons
        options={['day', 'time', 'sex', 'smoker']}
        value={selectedCategory}
        onChange={(value) => setSelectedCategory(value)}
      />
      <BarChart
        data={data}
        variable={selectedVariable}
        category={selectedCategory}
      />
    </div>
  );
}

function Dropdown({ options, value, onSelect }) {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    onSelect(selectedValue);
  };

  return (
    <select value={selectedOption} onChange={handleChange}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function RadioButtons({ options, value, onChange }) {
  return (
    <div>
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

function BarChart({ data, variable, category }) {
  const [averages, setAverages] = useState([]);

  useEffect(() => {
    // Group the data by the selected category
    const grouped = d3.group(data, (d) => d[category]);

    // Calculate the average value for each group
    const averages = Array.from(grouped, ([key, values]) => ({
      key,
      value: d3.mean(values, (d) => +d[variable]),
    }));

    setAverages(averages);
  }, [data, variable, category]);

  useEffect(() => {
    if (averages.length > 0) {
      // Clear the existing chart
      d3.select('#chart').html('');

      const margin = { top: 20, right: 20, bottom: 70, left: 80 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const x = d3.scaleBand().range([0, width]).padding(0.1);
      const y = d3.scaleLinear().range([height, 0]);

      const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      x.domain(averages.map((d) => d.key));
      y.domain([0, d3.max(averages, (d) => d.value)]);

      svg
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .append('text') // Adding X-axis Label
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', margin.bottom / 2)
        .style('text-anchor', 'middle')
        .text(category);

      svg
        .append('g')
        .call(d3.axisLeft(y))
        .append('text') // Adding Y-axis Label
        .attr('class', 'axis-label')
        .attr('y', -margin.left)
        .attr('x', -(height / 2))
        .attr('transform', 'rotate(-90)')
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(`Average ${variable}`);

      svg
        .selectAll('.bar')
        .data(averages)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.key))
        .attr('width', x.bandwidth())
        .attr('y', (d) => y(d.value))
        .attr('height', (d) => height - y(d.value))
        .attr('fill', '#ccc') // Set fill color to grey
        .append('title')
        .text((d) => `Average ${variable}: ${d.value.toFixed(2)}`);

      svg
        .selectAll('.bar-label')
        .data(averages)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => x(d.key) + x.bandwidth() / 2)
        .attr('y', (d) => y(d.value) + 20) // Adjusting y position for better visibility
        .attr('text-anchor', 'middle')
        .text((d) => d.value.toFixed(2));
    }
  }, [averages, variable, category]);

  return <div id="chart"></div>;
}

export default App;
