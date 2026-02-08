var $api_url = "/";
var $quality = 75;
var $pickWords = [];
var $chineseCharacters;
var $charMap = {};
var $drawMap = {};
var $sancaiKey = ["水", "木", "木", "火", "火", "土", "土", "金", "金", "水"];
var $sancai;
var $81;

$(function () {
  $(this).on("change", "#familyName", function () {
    if ($(this).val() == "") return;
    $("#combination").find("option").remove();
    $("#combination").append("<option value=''>請選擇</option>");

    var results = getCombinations($("#familyName").val());

    console.log(results);

    results.sort(function (a, b) {
      if (a.value < b.value) return 1;
      if (a.value > b.value) return -1;
      if (a.middle > b.middle) return 1;
      if (a.middle < b.middle) return -1;
      if (a.bottom > b.bottom) return 1;
      if (a.bottom < b.bottom) return -1;

      return -1;
    });

    for (key in results) {
      var item = results[key];
      var str =
        "適合筆畫: " +
        item.top +
        ", " +
        item.middle +
        ", " +
        item.bottom +
        " " +
        "(綜合分數:" +
        item.value +
        ")";
      $("#combination").append(
        $("<option></option>").attr("value", JSON.stringify(item)).text(str)
      );
    }
  });

  $(this).on("change", "#combination", function () {
    if ($(this).val() == "") return;
    var val = $.parseJSON($(this).val());

    // $pickWords calculation removed as it is now redundant with $charMap usage.

    var draw = 0;

    $(".sancai").html(val.key);
    $(".sancaiGoodOrbad").html($sancai[val.key].text);
    $(".sancaiContent").html($sancai[val.key].content);

    draw = val.top + 1;
    renderResult("top", draw);

    draw = val.top + val.middle;
    renderResult("middle", draw);

    draw = val.middle + val.bottom;
    renderResult("bottom", draw);

    draw = val.bottom + 1;
    renderResult("out", draw);

    draw = val.top + val.middle + val.bottom;
    renderResult("total", draw);

    $.get($api_url + $("#zodiac").val() + ".json", function (data) {
      $(".giveNameDrawCount1").html(val.middle);
      $(".giveName1_better").html(getWordsOf5E(data.better["_" + val.middle], val.middle));
      $(".giveName1_worse").html(getWordsOf5E(data.worse["_" + val.middle], val.middle));

      var normal = "";
      var middleGroups = $drawMap[val.middle] || [];
      var betterMap = {};
      var worseMap = {};
      var betterList = data.better["_" + val.middle] || [];
      var worseList = data.worse["_" + val.middle] || [];

      for(var b=0; b<betterList.length; b++) betterMap[betterList[b]] = true;
      for(var w=0; w<worseList.length; w++) worseMap[worseList[w]] = true;

      for (var k = 0; k < middleGroups.length; k++) {
          var chars = middleGroups[k].chars;
          for (var c = 0; c < chars.length; c++) {
              var char = chars[c];
              if (!betterMap[char] && !worseMap[char]) {
                  normal += char;
              }
          }
      }
      $(".giveName1_normal").html(getWordsOf5E(normal, val.middle));

      $(".giveNameDrawCount2").html(val.bottom);
      $(".giveName2_better").html(getWordsOf5E(data.better["_" + val.bottom], val.bottom));
      $(".giveName2_worse").html(getWordsOf5E(data.worse["_" + val.bottom], val.bottom));

      var normal2 = "";
      var bottomGroups = $drawMap[val.bottom] || [];
      var betterMap2 = {};
      var worseMap2 = {};
      var betterList2 = data.better["_" + val.bottom] || [];
      var worseList2 = data.worse["_" + val.bottom] || [];

      for(var b=0; b<betterList2.length; b++) betterMap2[betterList2[b]] = true;
      for(var w=0; w<worseList2.length; w++) worseMap2[worseList2[w]] = true;

      for (var k = 0; k < bottomGroups.length; k++) {
          var chars = bottomGroups[k].chars;
          for (var c = 0; c < chars.length; c++) {
              var char = chars[c];
              if (!betterMap2[char] && !worseMap2[char]) {
                  normal2 += char;
              }
          }
      }
      $(".giveName2_normal").html(getWordsOf5E(normal2, val.bottom));
    });
  });

  $(this).on("change", "#zodiac", function () {
    $("#familyName").trigger("change");
  });

  $(this).on("click", ".btnDisplay", function () {
    if ($(this).text() == "顯示") {
      $(this).text("隱藏");
      $(this).closest("tr").find("span").removeClass("hide");
    } else {
      $(this).text("顯示");
      $(this).closest("tr").find("span").addClass("hide");
    }
  });

  $.get($api_url + "ChineseCharacters.json", function (data) {
    //$.get($api_url + "KangXi.json", function (data) {
    $chineseCharacters = data;
    // Optimization: Build efficient lookups
    for (var i = 0, len = data.length; i < len; i++) {
        var group = data[i];
        var draw = group.draw;
        if (!$drawMap[draw]) {
            $drawMap[draw] = [];
        }
        $drawMap[draw].push(group);

        var chars = group.chars;
        for (var j = 0, cLen = chars.length; j < cLen; j++) {
            $charMap[chars[j]] = group;
        }
    }
  });

  $.get($api_url + "Sancai.json", function (data) {
    $sancai = data;
  });

  $.get($api_url + "EightyOne.json", function (data) {
    $81 = {};
    for (var key in data) {
      $81[data[key].draw] = data[key];
    }
  });
});

function renderResult(type, draw) {
  $("." + type + "DrawCount").html(draw);
  $("." + type + "5e").html(get5EColor(draw % 10));
  $("." + type + "GoodOrbad").html($81[draw].text);
  $("." + type + "Content").html(get81Content(draw));
}

function get81Content(draw) {
  return $81[draw].content;
}

function getWordsOf5E(chars, targetDraw) {
  var arr = [];
  if (chars) {
    for (var i = 0; i < chars.length; i++) {
      var char = chars[i];
      var info = $charMap[char];
      if (info && (!targetDraw || info.draw == targetDraw)) {
          arr.push(char + get5EColor(info.fiveEle));
      }
    }
  }
  return arr.join(", ");
}

function get5EColor(fiveEle) {
  switch (fiveEle) {
    case "木":
    case 1:
    case 2:
      return "<b style='color:green'>(木)</b>";
    case "火":
    case 3:
    case 4:
      return "<b style='color:red'>(火)</b>";
    case "土":
    case 5:
    case 6:
      return "<b style='color:brown'>(土)</b>";
    case "金":
    case 7:
    case 8:
      return "<b style='color:gold'>(金)</b>";
    case "水":
    case 0:
    case 9:
      return "<b style='color:blue'>(水)</b>";
  }
}

function getCombinations(familyName) {
  console.log(familyName);
  var topDrawCount = 0;
  var top5E = 0;

  var charData = $charMap[familyName];
  if (charData) {
      topDrawCount = charData.draw;
      top5E = (topDrawCount + 1) % 10;
      $(".familyName").html(
        familyName + get5EColor(charData.fiveEle)
      );
      $(".familyNameDrawCount").html(topDrawCount);
  }

  var results = [];
  for (var key in $sancai) {
    if (key[0] == $sancaiKey[top5E] && $sancai[key].value >= 8) {
      for (
        var middleCount = topDrawCount + 1;
        middleCount <= topDrawCount + 26;
        middleCount++
      ) {
        var middleFive = middleCount % 10;
        if ($sancaiKey[middleFive] == key[1]) {
          var middleDrawCount = middleCount - topDrawCount;
          for (
            var bottomCount = middleDrawCount + 1;
            bottomCount <= middleDrawCount + 26;
            bottomCount++
          ) {
            var bottomFive = bottomCount % 10;
            if ($sancaiKey[bottomFive] == key[2]) {
              var bottomDrawCount = bottomCount - middleDrawCount;

              var value = $81[topDrawCount + 1].value;
              value += $81[topDrawCount + middleDrawCount].value;
              value += $81[middleDrawCount + bottomDrawCount].value;
              value += $81[bottomDrawCount + 1].value;
              value +=
                $81[topDrawCount + middleDrawCount + bottomDrawCount].value;
              value *= 2;
              if (value >= Math.min(Math.max(0, $quality), 100)) {
                results.push({
                  key: key,
                  value: value,
                  top: topDrawCount,
                  middle: middleDrawCount,
                  bottom: bottomDrawCount,
                });
              }
            }
          }
        }
      }
    }
  }

  return results;
}
