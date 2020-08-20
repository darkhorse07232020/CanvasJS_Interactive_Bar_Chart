
create_filter(data1);

var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    toolTip: {
        shared: true
    },
    axisY2: {
        minimum: 0,
        maximum: 100,
        interval: 10,
        gridColor: "rgba(1,77,101,.1)",
    }
});

show_chart();

function show_chart(){

    chart.options.data = [];

    table_data = [];
    second_data=[];
    data1.forEach((el, i) => {
        if(document.getElementById(el['risk group']).checked){
            table_data.unshift({
                'label': el['risk group'],
                'y': Math.round(el['vaccinated'] * 100 / el['registered'])
            });
            second_data.unshift({
                'y': 0
            })
        }
    });

    chart.options.data.push({
        axisYType: "secondary",
        type: "stackedBar",
        indexLabelPlacement: "inside",
        indexLabelFontColor: "white",
        indexLabelFontSize: 16,
        indexLabel: '{y}%',
        color: '#005ce6',
        name: 'Original',
        dataPoints: table_data
    });
    chart.options.data.push({
        axisYType: "secondary",
        type: "stackedBar",
        indexLabelPlacement: "inside",
        indexLabelFontColor: "black",
        indexLabelFontSize: 16,
        color: '#d9d9d9',
        name: 'Appended',
        dataPoints: second_data
    });
    chart.render();
}

var xSnapDistance = 0;
var ySnapDistance = 0;

var xValue, yValue;

var mouseDown = false;
var selectedDataSeries = null;
var selectedDataPointX = null;
var selectedDatapointIndex = null;
var selectedSumIndex = null;
var changeCursor = false;
var timerId = null;
var chartType = "stackedBar";


function getPosition(e) {
    var parentOffset = $("#chartContainer > .canvasjs-chart-container").offset();
    var relX = e.pageX - parentOffset.left;
    var relY = e.pageY - parentOffset.top;
    xValue = Math.round(chart.axisX[0].convertPixelToValue(relY));
    yValue = Math.round(chart.axisY2[0].convertPixelToValue(relX));
}

function searchDataPoint(stackedValues) {
    for (x in stackedValues) {
        if (stackedValues.hasOwnProperty(x) && (xValue >= Number(x) - xSnapDistance && xValue <= Number(x) + xSnapDistance)) {

            if (mouseDown) {
                selectedDataPointX = x;
                selectedDataSeries = stackedValues[x][1].dataSeries;
                selectedDatapointIndex = stackedValues[x][1].dataPointIndex;
                selectedSumIndex = 1;
                return;
            } else {
                changeCursor = true;
                return;
            }
        } else {
            selectedDataPointX = null;
            selectedDataSeries = null;
            selectedDatapointIndex = null;
            selectedSumIndex = null;
            changeCursor = false;
        }
    }
}

function sumUpStacked(data, type) {
    var stackedSums = {};
    for (var i = 0; i < data.length; i++) {
        if (data[i].type === type) {
            var dataSeries = data[i].dataPoints;
            for (var j = 0; j < dataSeries.length; j++) {

                if (stackedSums[dataSeries[j].x]) {
                    var slectedStackSums = stackedSums[dataSeries[j].x];
                    slectedStackSums.push({
                        dataSeries: dataSeries,
                        dataPointIndex: j,
                        stackedSum: slectedStackSums[slectedStackSums.length - 1].stackedSum + dataSeries[j].y
                    });
                } else {
                    stackedSums[dataSeries[j].x] = [{
                        dataSeries: dataSeries,
                        dataPointIndex: j,
                        stackedSum: dataSeries[j].y
                    }]
                }

            }
        }
    }
    return stackedSums;
}

$("#chartContainer > .canvasjs-chart-container").on({
    mousedown: function (e) {
        mouseDown = true;
        getPosition(e);
        var stackedSums = sumUpStacked(chart.data, chartType);
        searchDataPoint(stackedSums);
    },

    mousemove: function (e) {
        getPosition(e);
        if (mouseDown) {
            clearTimeout(timerId);
            var stackedSums = sumUpStacked(chart.data, chartType);
            timerId = setTimeout(function () {
                if (selectedDataSeries != null) {
                    if (selectedSumIndex === 0)
                        selectedDataSeries[selectedDatapointIndex].y = yValue;
                    else
                        selectedDataSeries[selectedDatapointIndex].y = yValue - stackedSums[selectedDataPointX][selectedSumIndex - 1].stackedSum;
                    chart.render();
                }
            }, 0);
        } else {
            searchDataPoint(sumUpStacked(chart.data, chartType));
            if (changeCursor) {
                for (var i = 0; i < chart.data.length; i++)
                    chart.options.data[i].cursor = "e-resize";
            } else {
                for (var i = 0; i < chart.data.length; i++)
                    chart.options.data[i].cursor = "default";
            }
            chart.render();
        }
    },

    mouseup: function (e) {
        var stackedSums = sumUpStacked(chart.data, chartType);
        if (selectedDataSeries != null) {
        //     if (selectedSumIndex === 0){
        //         selectedDataSeries[selectedDatapointIndex].y = yValue;
                
        //     } else{
                selectedDataSeries[selectedDatapointIndex].y = yValue - stackedSums[selectedDataPointX][selectedSumIndex - 1].stackedSum;
                selectedDataSeries[selectedDatapointIndex].indexLabel = yValue + '%';
            // }
            chart.render();
        }
        mouseDown = false;
    }
});

function create_filter(new_data) {
    for (row in new_data) {
        $('#filter_area' + (row % 3)).append(`<div class="form-check" onclick='show_chart()'>
        <label class="form-check-label" for="` + new_data[row]['risk group'] + `">
        <input type="checkbox" class="form-check-input" id="` + new_data[row]['risk group'] + `" checked>` + new_data[row]['risk group'] + `</label>
        </div>`);
    }
}
