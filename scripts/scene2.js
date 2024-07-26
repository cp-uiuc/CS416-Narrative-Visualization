Promise.all([
    d3.csv(co2_url),
    d3.csv(country_url)
]).then(([co2_data, country_data]) => {
    // Data Processing
    const scene2_data = co2_data
        .filter(d => d.co2_including_luc)
        .map(d => ({
            ...d,
            year: +d.year,
            co2_including_luc: +d.co2_including_luc
        }));

    const region_data = country_data
        .filter(d => d['region'] && d['alpha-3']);

    const iso_map = new Map(region_data.map(d => [d['alpha-3'], d['region']]));

    const margin = { top: 180, right: 150, bottom: 50, left: 200 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const final_scene2_data = scene2_data.map(d => ({
        ...d,
        region: iso_map.get(d.iso_code) || 'Unknown'
    }));


    const colorScheme = [d3.schemeCategory10[0], d3.schemeCategory10[2], ...d3.schemeCategory10.slice(4, 6), d3.schemeCategory10[7]];
    const color = d3.scaleOrdinal(colorScheme);

    // SVG Setup
    const svg = d3.select("#scene2").select("svg").empty()
        ? d3.select("#scene2").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
        : d3.select("#scene2").select("svg").select("g");

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);

    // Update Function
    function update(year) {
        const data = final_scene2_data
            .filter(d => d.year === year && !!d.iso_code)
            .sort((a, b) => b.co2_including_luc - a.co2_including_luc)
            .slice(0, 20);

        // Update Scales
        x.domain([0, d3.max(data, d => d.co2_including_luc)]);
        y.domain(data.map(d => d.country));

        // Update Axes
        svg.selectAll(".x-axis").remove();
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(10, "s"));

        svg.selectAll(".y-axis").remove();
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Update Bars
        svg.selectAll(".bar").remove();
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.country))
            .attr("width", d => x(d.co2_including_luc))
            .attr("height", y.bandwidth())
            .attr("fill", d => color(d.region))
            .attr("stroke", d => d.country === "United States" || d.country === "China" ? "red" : "none")
            .attr("stroke-width", d => d.country === "United States" || d.country === "China" ? 2 : 0);

        // Update Labels
        svg.selectAll(".label").remove();
        svg.selectAll(".label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d.co2_including_luc) + 5)
            .attr("y", d => y(d.country) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .style("fill", "black")
            .text(d => (+d.co2_including_luc).toFixed(2));

        // Update Title
        svg.selectAll(".title").remove();
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2 - 10)
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .text(`Top 20 Countries by CO₂ Emissions for ${year}`);
    }

    // Initialize Axes and Labels
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(10, "s"));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("CO₂ Emissions (Million tonnes)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Country");

    svg.selectAll(".blurb").remove();
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 3 - 20)
        .attr("text-anchor", "middle")
        .attr("class", "blurb")
        .style("font-size", "14px")
        .style("line-height", "1.5")
        .selectAll("tspan")
        .data([
            "This scene highlights the top 20 countries by CO₂ emissions over the years. Use the year slider",
            "to see how their contributions have evolved over time, revealing shifts in global emission patterns."
        ])
        .enter()
        .append("tspan")
        .attr("x", width / 2)
        .attr("dy", (d, i) => i === 0 ? "1.2em" : "1.2em")
        .text(d => d);

    svg.selectAll(".annotation").remove();
    svg.append("foreignObject")
        .attr("x", width - 200)
        .attr("y", 100)
        .attr("width", 300)
        .attr("height", 100)
        .append("xhtml:div")
        .style("border", "1px solid red")
        .style("color", "black")
        .style("padding", "5px")
        .style("background", "white")
        .style("font-size", "12px")
        .html(`Up until the 21st century, the <b>United States</b> was the leading contributor to global CO₂ emissions. However, <b>China</b>'s rapid industrialization in the latter half of the 20th century and into the 21st century has now placed it in the lead. The graph illustrates this significant shift in emissions leadership.`);

    // Create Legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 50}, ${height - 100})`);

    const regions = Array.from(new Set(region_data.map(d => d.region)));

    legend.selectAll("rect")
        .data(regions)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d));

    legend.selectAll("text")
        .data(regions)
        .enter()
        .append("text")
        .attr("x", 24)
        .attr("y", (d, i) => i * 20 + 9)
        .attr("dy", ".35em")
        .text(d => d);

    // Handle Year Slider
    d3.selectAll("#slider-container-1").remove();
    const sliderContainer = d3.select("#scene2").append("div").attr("id", "slider-container-1");

    const slider = d3.select("#slider-container-1").append("input")
        .attr("type", "range")
        .attr("min", 1850)
        .attr("max", 2022)
        .attr("value", 2022)
        .attr("step", 1)
        .attr("id", "yearSlider");

    const yearLabel = d3.select("#slider-container-1").append("span")
        .attr("id", "yearLabel")
        .text(2022);

    slider.on("input", function () {
        const selectedYear = +this.value;
        yearLabel.text(selectedYear);
        update(selectedYear);
    });

    // Initialize with latest year data
    slider.property("value", 2022).dispatch("input");
});