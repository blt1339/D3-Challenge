// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis,width) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;

}
// function used for updating x-scale var upon click on axis label
function yScale(censusData, chosenYAxis,height) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))


  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]))


  return circlesGroup;
}
function renderXCircleText(textCircles, newXScale, chosenXAxis) {

  textCircles.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return textCircles;
}

function renderYCircleText(textCircles, newYScale, chosenYAxis) {

  textCircles.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis])+4);

  return textCircles;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  let tipXLabel;
  let tipYLabel;

  if (chosenXAxis === "poverty") {
    tipXLabel = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    tipXLabel = "Age (Median)";
  }
  else {
    tipXLabel = "Household Income (Median)";
  }


  if (chosenYAxis === "obesity") {
    tipYLabel = "Obese (%)";
  }
  else if (chosenYAxis === "smokes") {
    tipYLabel = "Smokes (%)";
  }
  else {
    tipYLabel = "Lacks Healthcare (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([40, 60])
    .html(function(d) {
      return (`${d.state}<br>${tipXLabel} ${d[chosenXAxis]}<br>${tipYLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
  })
    // on mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data,this);
    });

  return circlesGroup;
}

function drawChart() {
// Define the windo height and width
var svgWidth = window.innerWidth;
var svgHeight = window.innerHeight;

  var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svgArea = d3.select("body").select("svg");
// clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Import Data
d3.csv("D3_data_journalism/assets/data/data.csv").then(function(censusData) {
    // Parse Data/Cast as numbers
    // ==============================
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(censusData, chosenXAxis,width);

    var yLinearScale = yScale(censusData, chosenYAxis,height);

    // Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    // .attr("transform")
    .call(leftAxis);


    // append initial circles
    var circlesGroup = chartGroup.append("g")
      .selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "lightblue")
      .attr("opacity", ".6");

    // append text (state abbreviation) to inside of circles 
    var textCircles = chartGroup.append("g")
      .selectAll("text")
      .data(censusData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis])+4)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .style("fill", "white")
      .attr("font-weight", "bold");

    // Create group for two x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

      // Create group for two y-axis labels
      var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");


      var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)
        .text("In Poverty (%)");

      var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)
        .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)
        .text("Household Income (Median)");

        var obesityLabel = yLabelsGroup.append("text")
        .attr("x", -200)
        .attr("y", -80)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)
        .text("Obese (%)");

        var smokesLabel = yLabelsGroup.append("text")
        .attr("x", -200)
        .attr("y", -60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)        
        .text("Smokes (%)");

        var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", -200)
        .attr("y", -40)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)        
        .text("Lacks Helathcare (%)");

        // updateToolTip function inn
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // x axis labels event listener
        xLabelsGroup.selectAll("text")
          .on("click", function() {
          // get value of selection


          var xValue = d3.select(this).attr("value");

          if (xValue !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = xValue;

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis,width);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new X & Y values
            circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
            // Update the circle text for new X & Y values
            textCircles = renderXCircleText(textCircles, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              } else if (chosenXAxis === "age") {
                  ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
              } else {
                  incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
              }

            }

        });

        yLabelsGroup.selectAll("text")
          .on("click", function() {
          // get value of selection
          var yValue = d3.select(this).attr("value");

          if (yValue !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = yValue;

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(censusData, chosenYAxis,height);

            // updates x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
            textCircles = renderYCircleText(textCircles, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            console.log(chosenYAxis);
            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
              } else if (chosenYAxis === "smokes") {
                  smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                  healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
              } else {
                  healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
              }

              console.log('obesity');
              console.log(obesityLabel);
              console.log('smokes');
              console.log(smokesLabel);              
              console.log('healthcare');
              console.log(healthcareLabel);
          }
        });
  }).catch(function(error) {
    console.log(error);
  });
}


// Initial axis setup
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";
drawChart();

// When the browser window is resized, drawChart() is called.
d3.select(window).on("resize", drawChart);