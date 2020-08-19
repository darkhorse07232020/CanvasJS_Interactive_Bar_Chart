<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Patient table</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <script type="text/javascript" src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
  <script src="/assets/js/d3.js"></script>
  <style>
    rect {
      fill: darkblue;
      fill-opacity: 0.8;
    }
    rect1 {
      fill: grey;
      fill-opacity: 0.8;
    }
    rect:hover {
      fill-opacity: 1;
    }

    .axis {
      font-size: smaller;
    }

    svg text.label {
      fill: white;
      font: 15px;
      font-weight: 400;
      text-anchor: middle;
    }
  </style>
</head>

<body>
  <div class='container mt-3 border' align='center' id='main_area'>
    <h1>Patient Chart</h1>
    <div id='chart_area'></div>

    <div class='row' style="text-align: left;">
      <div id='filter_area0' class="form-check col-4"></div>
      <div id='filter_area1' class="form-check col-4"></div>
      <div id='filter_area2' class="form-check col-4"></div>
    </div>
  </div>

  <script type="text/javascript">

    mxwidth=$('#main_area').width();

    const margin = { top: 40, bottom: 10, left: 250, right: 20 };
    
    var widthX = mxwidth - margin.left - margin.right,
      heightX = 400 - margin.top - margin.bottom,
      delim = 4;

    var svgX = d3.select('#chart_area')
      .append("svg")
      .attr("width", widthX + margin.left + margin.right)
      .attr("height", heightX + margin.top + margin.bottom);

    var g = svgX.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Global variable for all data
    var data;

    // Scales setup
    const scaleX = d3.scaleLinear().range([0, widthX]);
    const scaleY = d3.scaleBand().rangeRound([0, heightX]).padding(0.2);

    // Axis setup
    const xaxis = d3.axisTop().scale(scaleX);
    const g_xaxis = g.append("g").attr("class", "x axis");
    const yaxis = d3.axisLeft().scale(scaleY);
    const g_yaxis = g.append("g").attr("class", "y axis");

    d3.json("/data/data.json").then((json) => {
      data = json.map(el => {
        return {
          "risk group": el['risk group'],
          'value': Math.round(el['vaccinated']*100/el['registered'])
      }});
      update_filter(data);
      update(data);
    });
    
    function update(new_data) {
      var new_data=new_data.filter(function(d){
        if(document.getElementById(d['risk group']).checked){
          return true;
        } else {
          return false;
        }
      });
      // console.log(new_data);
      //update the scales
      scaleX.domain([0, 100]);
      scaleY.domain(new_data.map((d) => d['risk group']));

      //render the axis
      g_xaxis.call(xaxis);
      g_yaxis.call(yaxis);

      const rect = g
        .selectAll("rect")
        .data(new_data)
        .join(
          // ENTER
          // new elements
          (enter) => {
            const rect_enter = enter.append("rect").attr("x", 0);
            rect_enter.append("title");
            return rect_enter;
          },
          // UPDATE
          // update existing elements
          (update) => update,
          // EXIT
          // elements that aren't associated with data
          (exit) => exit.remove()
        );
      
      rect
        .attr("height", scaleY.bandwidth())
        .attr("width", (d) => scaleX(Math.round(d.value)))
        .attr("y", (d) => scaleY(d['risk group']));

      rect.select("title").text((d) => d['risk group']);
    }

    //Filter
    d3.selectAll(".form-check").on("click", function handleClick(){
      update(data);
    });
    
    function update_filter(new_data){
      for(row in new_data)
      {
        $('#filter_area'+(row%3)).append(`<div class="form-check">
          <label class="form-check-label" for="` + new_data[row]['risk group'] + `">
          <input type="checkbox" class="form-check-input" id="` + new_data[row]['risk group'] + `" checked>` + new_data[row]['risk group'] + `</label>
        </div>`);
      }
    }

    
  </script>
</body>

</html>