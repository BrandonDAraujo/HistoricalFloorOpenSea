function myFunction() {
  const name = 1;
  const low = 2;
  const high = 3;
  const date = 4;
  const listingsC = 5;
  const offset = 2;

  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  const spread = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSheet((spread.getSheetByName("main")));

  let response = JSON.parse(UrlFetchApp.fetch("https://api.opensea.io/api/v1/events?collection_slug=ringers-by-dmitri-cherniak&event_type=created&only_opensea=false&offset=0&limit=300"))
  let current = new Date(response.asset_events[0].created_date).getDate();
  let tempObj;
  let finishedArray = []
  let lowest;
  let highest;
  let c = 0;
  let counter = 0;
  const dumpTemp = temp => {
    finishedArray.push(temp)
    lowest = null;
    highest = null;
    c = 0;
  }
  for(let x=1; response.asset_events.length > 0; x++){
    counter += response.asset_events.length
    for(let y=0; y<response.asset_events.length; y++){
      // Logger.log(`${new Date(response.asset_events[y].created_date).getDate()} ${current} ${new Date(response.asset_events[y].created_date).getDate() - current}`)
      if((new Date(response.asset_events[y].created_date).getDate() - current) == 0){
          let sPrice = (response.asset_events[y].starting_price * response.asset_events[y].payment_token.eth_price) / 1000000000000000000
          c++
          if(!lowest || sPrice < lowest){
            lowest = sPrice
            tempObj = {...tempObj,
              "name": `"${response.asset_events[y].asset.name}"`,
              "lowest": lowest,
              "date": `${response.asset_events[y].created_date}`,
              "listings": c
            }
          }
          if(!highest || sPrice > highest){
            highest = sPrice
            tempObj = {...tempObj,
              "highest": highest
            }
          }
      }else{
          dumpTemp(tempObj)
          current = new Date(response.asset_events[y].created_date).getDate()
      }
    }
    response = JSON.parse(UrlFetchApp.fetch(`https://api.opensea.io/api/v1/events?collection_slug=ringers-by-dmitri-cherniak&event_type=created&only_opensea=false&offset=${x*300}&limit=300`))
  }
  for(let z = 0; z<finishedArray.length; z++){
    let newOffset = offset + z
    spread.getActiveSheet().getRange(newOffset, low).setValue(finishedArray[z].lowest)
    spread.getActiveSheet().getRange(newOffset, date).setValue(finishedArray[z].date)
    spread.getActiveSheet().getRange(newOffset, high).setValue(finishedArray[z].highest)
    spread.getActiveSheet().getRange(newOffset, listingsC).setValue(finishedArray[z].listings)
    spread.getActiveSheet().getRange(newOffset, name).setValue(finishedArray[z].name)
  }
  SpreadsheetApp.setActiveSheet(spread.getSheetByName("chart"))

  let chartBuilder = spread.getActiveSheet().newChart();
  if (spread.getActiveSheet().getCharts()[0] != null) {
    let modify = spread.getActiveSheet().getCharts()[0].modify()
      .clearRanges()
      .addRange(spread.getActiveSheet().getRange(`main!${abc[date - 1]}${offset}:${abc[date - 1]}${counter + offset}`))
      .addRange(spread.getActiveSheet().getRange(`main!${abc[low - 1]}${offset}:${abc[low - 1]}${counter + offset}`))
      .addRange(spread.getActiveSheet().getRange(`main!${abc[high - 1]}${offset}:${abc[high - 1]}${counter + offset}`))
      .build();
    spread.getActiveSheet().updateChart(modify)
  } else {
    chartBuilder.addRange(spread.getActiveSheet().getRange("A1:D8"))
      .setChartType(Charts.ChartType.TIMELINE)
      .setOption('title', 'Lowest vs Highest')
      .setOption("height", 700)
      .setOption("width", 1786)
      .addRange(spread.getActiveSheet().getRange(`main!${abc[date - 1]}${offset}:${abc[date - 1]}${counter + offset}`))
      .addRange(spread.getActiveSheet().getRange(`main!${abc[high - 1]}${offset}:${abc[high - 1]}${counter + offset}`))
      .addRange(spread.getActiveSheet().getRange(`main!${abc[low - 1]}${offset}:${abc[low - 1]}${counter + offset}`));
    spread.getActiveSheet().insertChart(chartBuilder.setPosition(1, 1, 0, 0).build());
  }
  SpreadsheetApp.setActiveSheet(spread.getSheetByName("main"))
}
