// Load the data
d3.csv(co2_url).then(data => {

    const margin = { top: 140, right: 60, bottom: 80, left: 100 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3
        .select("#scene1")
        .select("svg")
        .empty() ? d3
            .select("#scene1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
        : d3.select("#scene1").select("svg").select("g");

    data = data.filter(d => d.country === "World" && +d.year >= 1850);

    data.forEach(d => {
        d.year = +d.year;
        d.co2_including_luc = d.co2_including_luc ? +d.co2_including_luc : 0; // Global CO₂ emissions including land-use change
        d.temperature_change_from_co2 = d.temperature_change_from_co2 ? +d.temperature_change_from_co2 : 0; // Global temperature change from CO₂
    });

    const x = d3.scaleLinear()
        .domain([1850, 2022])
        .range([0, width]);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.co2_including_luc)])
        .nice()
        .range([height, 0]);

    const y2 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.temperature_change_from_co2)])
        .nice()
        .range([height, 0]);

    const line1 = d3.line()
        .x(d => x(d.year))
        .y(d => y1(d.co2_including_luc));

    const line2 = d3.line()
        .x(d => x(d.year))
        .y(d => y2(d.temperature_change_from_co2));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("g")
        .call(d3.axisLeft(y1).ticks(10, "s"));

    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y2));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("CO₂ Emissions including Land-Use Change")
        .append("tspan")
        .attr("x", 0 - (height / 2))
        .attr("dy", "1.2em")
        .text("(Million tonnes)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Temperature Change from CO₂ (°C)");

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line1);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", line2);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#f9f9f9")
        .style("border", "1px solid #ddd")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("visibility", "hidden");

    const focusLine = svg.append("line")
        .attr("class", "focus-line")
        .style("stroke", "red")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0);

    const overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", mousemove)
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            focusLine.style("opacity", 0);
        });

    // Add circles for 1972 and 2022
    const importantYears = [1972, 2022];
    importantYears.forEach(year => {
        const yearData = data.find(d => d.year === year);
        svg.append("circle")
            .attr("cx", x(year))
            .attr("cy", y1(yearData.co2_including_luc))
            .attr("r", 5)
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);

        // Add year labels near dots
        svg.append("text")
            .attr("x", x(year) - 40)
            .attr("y", y1(yearData.co2_including_luc) - 10)
            .attr("text-anchor", "start")
            .style("font-size", "14px")
            .style("font-weight", "900")
            .style("fill", "black")
            .text(year);
    });

    const year1972 = data.find(d => d.year === 1972);
    const year2022 = data.find(d => d.year === 2022);
    const midpointY = (y1(year1972.co2_including_luc) + y1(year2022.co2_including_luc)) / 2;

    svg.append("foreignObject")
        .attr("x", x(1972) - 250) // Adjust x position to be to the left of the dots
        .attr("y", midpointY - 80)
        .attr("width", 300)
        .attr("height", 70)
        .append("xhtml:div")
        .style("border", "1px solid red")
        .style("color", "black")
        .style("padding", "5px")
        .style("background", "white")
        .style("font-size", "12px")
        .html(`CO₂ emissions nearly <b>doubled</b> from 1972 to 2022, increasing from <b>${year1972.co2_including_luc.toFixed(2)} to ${year2022.co2_including_luc.toFixed(2)} million tonnes</b>. This period also saw a significant temperature change from <b>${year1972.temperature_change_from_co2.toFixed(2)}°C to ${year2022.temperature_change_from_co2.toFixed(2)}°C.</b>`);


    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right - 100}, ${height + 40})`); // Adjust legend position

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "steelblue");

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text("CO₂ Emissions");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "orange");

    legend.append("text")
        .attr("x", 24)
        .attr("y", 29)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text("Temperature Change");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 - 40)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("Global CO₂ Emissions and Temperature Change");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 4 - 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("line-height", "1.5") // Improve readability with line height
        .text("This scene explores the historical relationship between CO₂ emissions and global temperature change.");

    function mousemove(event) {
        const mouse = d3.pointer(event, this);
        const mouseX = mouse[0];
        const year = x.invert(mouseX);
        const bisect = d3.bisector(d => d.year).left;
        const index = bisect(data, year, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        const d = year - d0.year > d1.year - year ? d1 : d0;

        focusLine
            .attr("x1", x(d.year))
            .attr("x2", x(d.year))
            .attr("y1", 0)
            .attr("y2", height)
            .style("opacity", 1);

        tooltip
            .style("visibility", "visible")
            .html(`Year: <b>${d.year}</b><br>CO₂ Emissions: <b>${d.co2_including_luc}</b> Million tonnes<br>Temperature Change: <b>${d.temperature_change_from_co2}</b> °C`)
            .style("top", event.pageY + 10 + "px")
            .style("left", event.pageX + 10 + "px");
    }
});

