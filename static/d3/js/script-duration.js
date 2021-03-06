function ajax_freq_per_date(callback, value) {
    var url = "/result-freq-per-date/";
    if(value !== undefined && value !== null){
        url += "?intervalle=" + value;
    }
    d3.json(url, function (json) {
        if(value !== undefined && value !== null){
            for(var i = 0; i < json.length; i++){
                json[i].stop_date = json[i].start_date + parseInt(value);
                if(i !== json.length - 1){
                    json[i+1].start_date = json[i].stop_date;
                }
            }
        }
        histogram(json);
    });
}


function histogram(freq_per_date) {
    if (freq_per_date !== null) {
        var difference = freq_per_date[0].stop_date - freq_per_date[0].start_date;
        var formatTime = difference ===30 ? d3.time.format("à %Hh%Mmin:%Ssec") : d3.time.format("Le %d-%m à %Hh%Mmin");
        var bins = [];
        for (var i = 0; i <= freq_per_date.length - 1; i++) {
            bins.push(formatTime(new Date((1000 * freq_per_date[i].start_date))));
            bins.push(formatTime(new Date((1000 * freq_per_date[i].stop_date))));
        }
        var dates = [];

        for (var i = 0; i <= freq_per_date.length - 1; i++) {
            dates.push(freq_per_date[i].start_date);
            dates.push(freq_per_date[i].stop_date);
        }
        var freq = [];
        for (var i = 0; i <= freq_per_date.length - 1; i++) {
            freq.push(freq_per_date[i].freq);
        }
        var height = 550;
        var heightCart = 500;
        $('#histogram_area').addClass('interface_element');

        if ($('#histogram').find('svg')) {
            $('#histogram').find('svg').remove();
        }
        var svg = d3.select('#histogram').append('svg')
            .attr("transform", "translate(25,25)");

        //var diff = (d3.max(dates) - d3.min(dates)) / dates.length;

        var xScale = d3.scalePoint()
            .range([0, 30 * bins.length / 2]);
        xScale.domain(bins);

        var color = d3.scale.category20c();


        svg.attr("width", 30 * freq.length + 200)
            .attr("height", height + 200);
        svg.selectAll('rect').data(freq).enter().append('rect')
            .attr("width", 30)
            .attr("class", "smooth_scroll_btn")
            .attr("data_id", "periode")
            .attr('height', function (d) {
                return ((d / d3.max(freq)) * heightCart);
            })
            .attr('x', function (d, i) {
                return i * 30;
            })
            .attr('y', function (d) {
                return height - ((d / d3.max(freq)) * heightCart);
            })
            .attr("transform", "translate(" + 100 + "," + 0 + " )")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr('id', function (d, i) {
                return i;
            })
            .on("click", function (d, i) {
                var da = dates[0] + difference * i;
                var s = da + difference;

                $('#little-wordcloud').hide();
                $('#twitterwidget').empty();
                $('#lw_tw').show();
                $('#loading_circle_little_wordcloud').show();
                $('#loading_circle_tweets').show();
                $('#periode_scroll').removeClass("disabled");

                var formatDate1 = d3.time.format("%d/%m/%y à %Hh%Mm%Ss");
                var formatDate2 = d3.time.format("au %d/%m/%y à %Hh%Mm%Ss");
                var debut = formatDate1(new Date(1000 * da));
                var fin = formatDate2(new Date(1000 * s));

                $('#periode_selected').text("Période du " + debut + " " + fin);
                d3.json("/result-wordcloud/" + da + "/" + s, function (json) {
                    mycloud.stop().words(json).start().on("end", draw(json, "little-wordcloud"));
                    console.log(json);
                    $('#loading_circle_little_wordcloud').hide();
                    $('#little-wordcloud').show();
                });

                d3.json("/get-tweets/" + da + "/" + s, function (json) {
                    displayTweets(json);
                    $('#loading_circle_tweets').hide();
                });

            });

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(" + 100 + "," + height + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(freq)])
            .range([height, height - heightCart]);

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale).ticks(3))
            .attr("transform", "translate(" + 100 + ", 0)")
            .append("text")
            .attr("y", 2)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")

    }
}

function displayTweets(json) {
    ($('.graphs').has(".tweets").length ? console.log("yes") : $('.graphs').append("<div class=\"tweets zoom_periode\"></div>"));
    if ($('.tweets').children.length > 0) {
        $('.tweets').empty();
    }
    var i;
    for (i = 0; i < json.length; i++) {
        $('.tweets').append("<div class=\"tweet\" id=" + json[i].id + "></div>");
    }
    $('.tweets').children().each(function (t, tweet) {
        var id = $(this).attr('id');
        twttr.widgets.createTweet(
            id, tweet,
            {
                conversation: 'none',    // or all
                cards: 'hidden',  // or visible
                linkColor: '#cc0000', // default is blue
                theme: 'light'    // or dark
            }
        );
    });
    scrollIfNeeded($('.tweet'), $('.tweets'));
}

function scrollIfNeeded(element, container) {
    if (element.offsetTop < container.scrollTop) {
        container.scrollTop = element.offsetTop;
    } else {
        const offsetBottom = element.offsetTop + element.offsetHeight;
        const scrollBottom = container.scrollTop + container.offsetHeight;
        if (offsetBottom > scrollBottom) {
            container.scrollTop = offsetBottom - container.offsetHeight;
        }
    }
}
