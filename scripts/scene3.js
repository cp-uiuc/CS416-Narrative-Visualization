

// Load the CO₂ data
d3.csv(co2_url).then((data) => {

    const margin = { top: 160, right: 80, bottom: 60, left: 150 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const industryLabels = {
        'other_industry_co2': 'Other Industries',
        'land_use_change_co2': 'Land use change',
        'flaring_co2': 'Flaring',
        'cement_co2': 'Cement',
        'gas_co2': 'Gas',
        'oil_co2': 'Oil',
        'coal_co2': 'Coal'
    };

    const colorScheme = [d3.schemeCategory10[0], d3.schemeCategory10[2], ...d3.schemeCategory10.slice(4, 6), d3.schemeCategory10[7]];
    const colors = d3.scaleOrdinal()
        .domain(Object.keys(industryLabels))
        .range(colorScheme);

    // Initial setup
    const svg = d3
        .select("#scene3")
        .select("svg")
        .empty() ? d3
            .select("#scene3")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
        : d3.select("#scene3").select("svg").select("g");

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([height, 0]).padding(0.1);

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("CO₂ Emissions (Million tonnes)");

        svg.selectAll(".annotation").remove();
        svg.append("foreignObject")
            .attr("x", width - 300)
            .attr("y", height - 200)
            .attr("width", 300)
            .attr("height", 100)
            .append("xhtml:div")
            .style("border", "1px solid red")
            .style("color", "black")
            .style("padding", "5px")
            .style("background", "white")
            .style("font-size", "12px")
            .html(`Throughout the 20th and early 21st centuries, fossil fuels—specifically <b>coal, oil, and gas</b>—have become increasingly dominant in global CO₂ emissions. In the graph, these industries are highlighted with red outlines, emphasizing their growing contribution to global CO₂ levels over time.`);

    function update(year) {
        // Filter data by selected year
        const filteredData = data.filter(d => d.year == year);

        // Prepare data
        const industry_data = Object.keys(industryLabels).map(industry => ({
            label: industryLabels[industry],
            emissions: d3.sum(filteredData.map(d => d[industry] ? +d[industry] : 0))
        }));

        industry_data.sort((a, b) => a.emissions - b.emissions);

        // Update scales
        x.domain([0, d3.max(industry_data, d => d.emissions)]);
        y.domain(industry_data.map(d => d.label));

        // Update bars
        svg.selectAll(".bar")
            .data(industry_data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.label))
            .attr("width", d => x(d.emissions))
            .attr("height", y.bandwidth())
            .attr("fill", d => colors(d.label))
            .attr("stroke", d => d.label === 'Coal' || d.label === 'Oil' || d.label === 'Gas' ? "red" : "none")
            .attr("stroke-width", d => d.label === 'Coal' || d.label === 'Oil' || d.label === 'Gas' ? 3 : 0)

        // Remove old annotations
        svg.selectAll(".label").remove();

        // Add annotations
        svg.selectAll(".label")
            .data(industry_data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d.emissions) + 5)
            .attr("y", d => y(d.label) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .style("fill", "black")
            .html(d => `${d.emissions.toFixed(2)}`);

        // Update x-axis
        svg.selectAll(".x-axis").remove();
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(10, "s"))
            .selectAll("text")
            .attr("font-size", "12px");

        // Update y-axis
        svg.selectAll(".y-axis").remove();
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("font-size", "12px");

        // Update title and blurb
        svg.selectAll(".title").remove();
        svg.selectAll(".blurb").remove();
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2 - 60)
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .text(`Global CO₂ Emissions by Industry for ${year}`);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 3 - 60)
            .attr("text-anchor", "middle")
            .attr("class", "blurb")
            .style("font-size", "14px")
            .style("line-height", "1.5")
            .selectAll("tspan")
            .data([
                "This scene examines how different industries contribute to global CO₂ emissions. Use the year",
                "slider to see how these contributions have changed from 1850 to 2022, highlighting the evolving",
                "impact of industrial activities on CO₂ levels."
            ])
            .enter()
            .append("tspan")
            .attr("x", width / 2)
            .attr("dy", (d, i) => i === 0 ? "1.2em" : "1.2em")
            .text(d => d);
    }

    // Initial update
    update(2022);

    // Set up slider interaction
    d3.selectAll("#slider-container-2").remove();
    const sliderContainer = d3.select("#scene3").append("div").attr("id", "slider-container-2");

    const slider = d3.select("#slider-container-2").append("input")
        .attr("type", "range")
        .attr("min", 1850)
        .attr("max", 2022)
        .attr("value", 2022)
        .attr("step", 1)
        .attr("id", "yearSlider");

    const yearLabel = d3.select("#slider-container-2").append("span")
        .attr("id", "yearLabel")
        .text(2022);

    slider.on("input", function () {
        const selectedYear = +this.value;
        yearLabel.text(selectedYear);
        update(selectedYear);
    });

    // Initially display the latest year data
    slider.property("value", 2022).dispatch("input");
});