d3.select("#wordcloud").append("svg")
    .attr("width", 600)
    .attr("height", 600);
d3.select("#little-wordcloud").append("svg")
    .attr("width", 600)
    .attr("height", 600);

var fontsize = d3.scale.log().range([10, 50]);

var mycloud = d3.layout.cloud().size([600, 600])
    .words([])
    .rotate(function () {
        return ~~(Math.random() * 2) * 90;
    })
    .fontSize(function (d) {
        return fontsize(d.size);
    })
    .font("Impact")
    .padding(2);

function draw(words, divElement) {
    var fill = d3.scale.category20();
    var element = d3.select("#" + divElement);
    element.selectAll("svg").selectAll("g")
        .transition()
        .duration(1000)
        .style("opacity", 1e-6)
        .remove();

    element.selectAll("svg")
        .append("g")
        .attr("transform", "translate(300,300)")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .style("font-size", function (d) {
            return d.size * 1 + "px";
        })
        .style("fill", function (d, i) {
            return fill(i);
        })
        .style("opacity", 1e-6)
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .transition()
        .style("opacity", 1)
        .duration(1000)
        .text(function (d) {
            return d.text;
        });
}

function ajax_wordcloud(){
    $.ajax({
        url: '/result-wordcloud/',
        type: 'GET',
        data: { get_param: 'value' },
        dataType: 'json',

        success: function (response) {
            $('#loading_circle').hide();
            var stream_button_pressed = $('#start-stream_button').is(":disabled");
             mycloud.stop().words(response).start().on("end", draw(response, "wordcloud"));
            if(stream_button_pressed){
                refresh_wordcloud(true);
            }

        },
        error: function (error) {
            /**/
        }
    });
}

function ajax_freq_per_date() {
    if((startdate != "")&&(stopdate != "")){
        d3.json("http://127.0.0.1:5000/result-freq-per-date/" + startdate + "/" + stopdate + "/", function (json) {
            histogram(json);
        });
    }
    else{
        console.log("toto");
        d3.json("http://127.0.0.1:5000/result-freq-per-date/", function (json) {
            histogram(json);
        });
    }

}


$(document).ready(function () {
    ajax_freq_per_date();
    ajax_wordcloud();
});
