$(function (){
	var stockCode = "000001";
	var stage = {
		graph: {
			k: {
				dataSource: "http://route.showapi.com/131-52",
				appid: 48192,
				sign: "2910864053214b3ab64fde0632e509b5",
				type: {
					5: "5分钟K线", 
					30: "30分钟K线",
					60: "60分钟K线",
					day: "日K线", 
					week: "周K线",
					month: "月K线"
				},
				element: "kGraph"
			}
		}
	};

	var calculateMA = function(dayCount, data) {
		var result = [];
		for (var i = 0, len = data.length; i < len; i++) {
			if (i < dayCount) {
				result.push('-');
				continue;
			}
			var sum = 0;
			for (var j = 0; j < dayCount; j++) {
				sum += parseFloat(data[i - j][1]);
			}
			// console.log(sum,dayCount);
			result.push((sum / dayCount).toFixed(3));
		}
		// console.log(result);
		return result;
	}

	var setEcharts = function(nodeName, option) {
		var chart = echarts.init(document.getElementById(nodeName));
		chart && option && chart.setOption(option);
	};

	// 创建K线图
	var createGraphK = function (code, interval, type, begin) {
		var createK = function (dates, data) {
			var option = {
				backgroundColor: '#21202D',
				legend: {
					data: [type, 'MA5', 'MA10', 'MA20', 'MA30'],
					inactiveColor: '#777',
					textStyle: {
						color: '#fff'
					}
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						animation: false,
						type: 'cross',
						lineStyle: {
							color: '#376df4',
							width: 2,
							opacity: 1
						}
					}
				},
				xAxis: {
					type: 'category',
					data: dates,
					axisLine: { lineStyle: { color: '#8392A5' } }
				},
				yAxis: {
					scale: true,
					axisLine: { lineStyle: { color: '#8392A5' } },
					splitLine: { show: false }
				},
				grid: {
					bottom: 80
				},
				dataZoom: [{
					textStyle: {
						color: '#8392A5'
					},
					handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
					handleSize: '80%',
					dataBackground: {
						areaStyle: {
							color: '#8392A5'
						},
						lineStyle: {
							opacity: 0.8,
							color: '#8392A5'
						}
					},
					handleStyle: {
						color: '#fff',
						shadowBlur: 3,
						shadowColor: 'rgba(0, 0, 0, 0.6)',
						shadowOffsetX: 2,
						shadowOffsetY: 2
					}
				}, {
					type: 'inside'
				}],
				animation: false,
				series: [
				{
					type: 'candlestick',
					name: type,
					data: data,
					itemStyle: {
						normal: {
							color: '#FD1050',
							color0: '#0CF49B',
							borderColor: '#FD1050',
							borderColor0: '#0CF49B'
						}
					}
				},
				{
					name: 'MA5',
					type: 'line',
					data: calculateMA(5, data),
					smooth: true,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1
						}
					}
				},
				{
					name: 'MA10',
					type: 'line',
					data: calculateMA(10, data),
					smooth: true,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1
						}
					}
				},
				{
					name: 'MA20',
					type: 'line',
					data: calculateMA(20, data),
					smooth: true,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1
						}
					}
				},
				{
					name: 'MA30',
					type: 'line',
					data: calculateMA(30, data),
					smooth: true,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1
						}
					}
				}
				]
			};
			setEcharts(stage.graph.k.element, option);
		};

		$.get(stage.graph.k.dataSource, {code: code, time: interval, beginDay: begin, showapi_appid: stage.graph.k.appid, showapi_sign: stage.graph.k.sign}, function (data) {
			if(data.showapi_res_code === 0) {
				var set = data.showapi_res_body.dataList;
				set.reverse();
				// 日期、开盘、收盘、最低、最高
				createK(set.map(item => [item.time.substr(0,4), item.time.substr(4,2), item.time.substr(6,2)].join("-") + (item.time.length == 8? "": " "+ [item.time.substr(8,2), item.time.substr(10,2)].join(":"))), set.map(item => [item.open, item.close, item.min, item.max]));
			}
		});
	};

	$(function (){
		// 在一位月、日 前 +0 转换为两位
		var getDoubleBit = function (number) {
			return (number > 0 && number < 10) ? "0" + number: number;
		};
		// 获取yyyyMMDD格式日期数字
		var getDateNumber = function (date) {
			return "" + (date.getYear()+1900) + "-" + getDoubleBit(date.getMonth() + 1) + "-" + getDoubleBit(date.getDate());
		};
		var currentK = {name: "日K线", type: "day"}, date = new Date(), today = getDateNumber(date), monthBefore = getDateNumber(new Date(date.getTime()-86400000*30));
		$("#beginTime").val(monthBefore);		

		for(var index in stage.graph.k.type) {
			$("<option" + (index == "day"? " selected": "") + ">" + stage.graph.k.type[index] + "</option>")
				.appendTo($("#kInterval"));
		}

		$("#kInterval").change(function () {
			var name = $("#kInterval").find("option:selected").text();
			for(var idx in stage.graph.k.type) {
				if(stage.graph.k.type[idx] == name) {
					currentK = {name: name, type: idx};
					createGraphK(stockCode, idx, name, ($("#beginTime").val() || monthBefore).replace(/\-/g, ""));
				}
			}
		});

		$("#beginTime").change(function () {
			createGraphK(stockCode, currentK.type, currentK.name, (this.value || monthBefore).replace(/\-/g, ""));
		});

		createGraphK(stockCode, "day", stage.graph.k.type["day"], monthBefore.replace(/\-/g, ""));
	});
});