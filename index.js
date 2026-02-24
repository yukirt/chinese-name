var $api_url = "/";
var $quality = 75;
var $selectedDraws = [];
var $chineseCharacters;
var $charMap = {};
var $sancaiKey = ["水", "木", "木", "火", "火", "土", "土", "金", "金", "水"];
var $sancai;
var $81;

$(function () {
  $(this).on("change", "#familyName", function () {
    var familyName = $(this).val();
    if (familyName == "") return;
    $("#combination").find("option").remove();
    $("#combination").append("<option value=''>請選擇</option>");

    var results = getCombinations(familyName);

    results.sort(function (a, b) {
      if (a.value < b.value) return 1;
      if (a.value > b.value) return -1;
      if (a.middle > b.middle) return 1;
      if (a.middle < b.middle) return -1;
      if (a.bottom > b.bottom) return 1;
      if (a.bottom < b.bottom) return -1;
      return -1;
    });

    for (var key in results) {
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

    $selectedDraws = [val.middle, val.bottom];
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
      $(".giveName1_better").html(getWordsOf5E(data.better["_" + val.middle]));
      $(".giveName1_worse").html(getWordsOf5E(data.worse["_" + val.middle]));

      var normal = "";
      if ($chineseCharacters) {
        var i = $chineseCharacters.length;
        while (i--) {
          if ($chineseCharacters[i].draw === val.middle) {
            var chars = $chineseCharacters[i].chars;
            var j = chars.length;
            while (j--) {
              var c = chars[j];
              if (
                (!data.better["_" + val.middle] ||
                  data.better["_" + val.middle].indexOf(c) == -1) &&
                (!data.worse["_" + val.middle] ||
                  data.worse["_" + val.middle].indexOf(c) == -1)
              )
                normal += c;
            }
          }
        }
      }
      $(".giveName1_normal").html(getWordsOf5E(normal));

      $(".giveNameDrawCount2").html(val.bottom);
      $(".giveName2_better").html(getWordsOf5E(data.better["_" + val.bottom]));
      $(".giveName2_worse").html(getWordsOf5E(data.worse["_" + val.bottom]));
      var normal2 = "";
      if ($chineseCharacters) {
        var i = $chineseCharacters.length;
        while (i--) {
          if ($chineseCharacters[i].draw === val.bottom) {
            var chars = $chineseCharacters[i].chars;
            var j = chars.length;
            while (j--) {
              var c = chars[j];
              if (
                (!data.better["_" + val.bottom] ||
                  data.better["_" + val.bottom].indexOf(c) == -1) &&
                (!data.worse["_" + val.bottom] ||
                  data.worse["_" + val.bottom].indexOf(c) == -1)
              )
                normal2 += c;
            }
          }
        }
      }
      $(".giveName2_normal").html(getWordsOf5E(normal2));
    });
  });

  $(this).on("change", "#zodiac", function () {
    $("#familyName").trigger("change");
  });

  $(this).on("click", ".btnDisplay", function (e) {
    e.preventDefault();
    if ($(this).text() == "顯示") {
      $(this).text("隱藏");
      $(this).closest("tr").find("span").removeClass("hide");
    } else {
      $(this).text("顯示");
      $(this).closest("tr").find("span").addClass("hide");
    }
  });

  $.get($api_url + "ChineseCharacters.json", function (data) {
    $chineseCharacters = data;
    $charMap = {};
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      for (var j = 0; j < item.chars.length; j++) {
        var char = item.chars[j];
        if (!$charMap[char]) {
          $charMap[char] = [];
        }
        var exists = false;
        for (var k = 0; k < $charMap[char].length; k++) {
          if ($charMap[char][k].draw === item.draw && $charMap[char][k].fiveEle === item.fiveEle) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          $charMap[char].push({
            draw: item.draw,
            fiveEle: item.fiveEle,
          });
        }
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
  $("." + type + "DrawCount").text(draw);
  $("." + type + "5e").html(get5EColor(draw % 10));
  // Use .html() as these fields may contain <br /> tags for formatting
  $("." + type + "GoodOrbad").html($81[draw].text);
  $("." + type + "Content").html($81[draw].content);
}

function getWordsOf5E(chars) {
  var arr = [];
  if (chars) {
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      var entries = $charMap[c];
      if (entries) {
        for (var k = 0; k < entries.length; k++) {
          var entry = entries[k];
          if ($selectedDraws.indexOf(entry.draw) != -1) {
            arr.push(c + get5EColor(entry.fiveEle));
          }
        }
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
  var topDrawCount = 0;
  var top5E = 0;

  var entries = $charMap[familyName];
  if (entries && entries.length > 0) {
    var entry = entries[0];
    topDrawCount = entry.draw;
    top5E = (topDrawCount + 1) % 10;
    $(".familyName").text(familyName).append(get5EColor(entry.fiveEle));
    $(".familyNameDrawCount").text(topDrawCount);
  }

  var results = [];
  if (!$sancai || !$81) return results;

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
