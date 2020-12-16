import mapboxgl from "mapbox-gl";
import Point from "./helpers/map-Point";
mapboxgl.accessToken = 'pk.eyJ1IjoiZHl1c2hraW45MyIsImEiOiJja2loeDVjdXAwYjhlMzBwYmdhaWhwNnc2In0.nu3gIVzrRiwm1qqK6EGmEA';

export default class CovidMap {
  constructor(covidData) {
    this.covidData = covidData;
    this.typeOfData = "cases";
    this.units = "absolute";
    this.period = "total";
    this.tooltipTimeout;
    this.tooltip = document.createElement("div");

    this.colors = {
      cases: "#FF0000",
      newCases: "#FF0000",
      deaths: "#0000FF",
      newDeaths: "#0000FF",
      recovered: "#00FF00",
      newRecovered: "#00FF00",
    }

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/dyushkin93/ckihx7sv06zez19k0dnpdbkdx', // stylesheet location
      center: [30, 40], // starting position [lng, lat]
      zoom: 2, // starting zoom
      maxPitch: 0,
      dragRotate: 0
    });

    this.nav = new mapboxgl.NavigationControl({
      showZoom: true
    });

    this.map.addControl(this.nav, "bottom-right");

    this.points = {
      "type": "FeatureCollection",
      "features": []
    }

    for (const key in this.covidData) {
      if (this.covidData.hasOwnProperty(key) && key !== "world") {
        const country = this.covidData[key];
        this.points.features.push(new Point(country));
      }
    }

    this.layer = {
      id: "circles",
      type: "circle",
      source: "points",
      paint: {
        "circle-color": this.colors[this.typeOfData],
        "circle-opacity": .5,
        "circle-radius": this.getCircleRadius,
      }
    }

    this.map.on("load", () => {
      this.map.addSource("points", {
        type: "geojson",
        data: this.points,
      })

      this.map.addLayer(this.layer);
      this.map.on("mousemove", this.showTooltip)
    })

    this.showTooltip = (e) => {
      clearTimeout(this.tooltipTimeout);
      const timeout = setTimeout(() => {
        this.tooltip.remove();
        this.tooltip.innerHTML = "";
      }, 500);
      this.tooltipTimeout = setTimeout(async () => {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/
        ${e.lngLat.lng},${e.lngLat.lat}.json?types=country&access_token=${mapboxgl.accessToken}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log(e);

        if (data.features.length > 0) {
          this.tooltip.append(mapMarker.content.cloneNode(true));
          this.tooltip.querySelector(".marker_country-name").innerHTML = data.features[0].text;
          this.tooltip.querySelector(".marker").style.right = `${map.clientWidth - e.point.x}px`;
          this.tooltip.querySelector(".marker").style.bottom = `${map.clientHeight - e.point.y + 16}px`;

          let code = data.features[0].properties.short_code.toUpperCase();

          if (this.covidData[code]) {
            this.tooltip.querySelector(".marker_value").innerHTML = new Intl.NumberFormat('ru-RU').format(this.covidData[code][this.typeOfData]);

            let typeOfDataToShow = this.typeOfData;
            if (typeOfDataToShow.slice(0, 3) === "new") {
              typeOfDataToShow = typeOfDataToShow.slice(3);
            }
            this.tooltip.querySelector(".marker_cases").innerHTML = typeOfDataToShow;

            let unitsToShow = this.units;
            if (unitsToShow === "absolute") {
              unitsToShow = "people";
            } else if (unitsToShow === "relative") {
              unitsToShow = "per 100k people";
            }
            this.tooltip.querySelector(".marker_units").innerHTML = unitsToShow;
          } else {
            this.tooltip.querySelector(".marker_cases").innerHTML = "no data";
          }

          map.append(this.tooltip);
        }
      }, 600);
    }
  }

  get getCircleRadius() {
    const maxValue = Math.max(...this.points.features.map((point) => point.properties[this.typeOfData]));
    const radius = {
      property: this.typeOfData,
      stops: [
        [0, 4],
        [maxValue * .2, 30],
        [maxValue, 55]
      ],
    }
    return radius;
  }

  switchData({typeOfData, period, units}) {
    if (typeOfData) {
      this.typeOfData = typeOfData;
    }

    if (period) {
      this.period = period;
    }
 
    if (units) {
      this.units = units;
    }

    this.update();
  }

  update() {
    if (this.period === "last") {
      this.typeOfData = `new${this.typeOfData.charAt(0).toUpperCase() + this.typeOfData.slice(1)}`;
    }

    this.points.features.forEach((point) => {
      if (this.units === "relative") {
        const population = this.covidData[point.properties.countryCode].population / 100000;
        for (const key in point.properties) {
          if (point.properties.hasOwnProperty(key)) {
            const element = point.properties[key];
            if (typeof element === "number");
            element = (element / population).toFixed(3);
          }
        }
      } else if (this.units = "absolute") {
        const country = this.covidData[point.properties.countryCode];
        point.properties.cases = country.cases;
        point.properties.newCases = country.newCases;
        point.properties.deaths = country.deaths;
        point.properties.newDeath = country.newDeath;
        point.properties.recovered = country.recovered;
        point.properties.newRecovered = country.newRecovered;
      }
    });
  
    this.map.getSource("points").setData(this.points);
    this.map.setPaintProperty("circles", "circle-radius", this.getCircleRadius);
    this.map.setPaintProperty("circles", "circle-color", this.colors[this.typeOfData]);
  }
}