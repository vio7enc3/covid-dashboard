export default class GlobalDataBlock {
  constructor(covidData) {
    this.covidData = covidData;
    this.countryToShow = this.covidData.WORLD;
    this.units = 'absolute';
    this.period = 'total';
    // elements where data should be exported
    this.casesElem = document.querySelector('#cases-count') || document.createElement('div');
    this.deathsElem = document.querySelector('#death-count') || document.createElement('div');
    this.recoveredElem = document.querySelector('#recovered-count') || document.createElement('div');

    this.casesToShow = 0;
    this.deathsToShow = 0;
    this.recoveredToShow = 0;

    this.update();
  }

  /**
   *
   * @param {String} param0.countryCode
   * @param {"total"|"last"} param0.covidData
   * @param {"absolute"|"relative"} param0.units
   */
  switchData({ countryCode, period, units }) {
    if (countryCode) {
      this.countryToShow = this.covidData[countryCode.toUpperCase()];
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
    if (this.period === 'total') {
      this.casesToShow = this.countryToShow.cases;
      this.deathsToShow = this.countryToShow.deaths;
      this.recoveredToShow = this.countryToShow.recovered;
    } else if (this.period === 'last') {
      this.casesToShow = this.countryToShow.newCases;
      this.deathsToShow = this.countryToShow.newDeaths;
      this.recoveredToShow = this.countryToShow.newRecovered;
    }

    if (this.units === 'relative') {
      this.casesToShow /= (this.countryToShow.population / 100000);
      this.deathsToShow /= (this.countryToShow.population / 100000);
      this.recoveredToShow /= (this.countryToShow.population / 100000);
      this.casesToShow = this.casesToShow.toFixed(3);
      this.deathsToShow = this.deathsToShow.toFixed(3);
      this.recoveredToShow = this.recoveredToShow.toFixed(3);
    }

    this.casesElem.innerHTML = new Intl.NumberFormat('ru-RU').format(this.casesToShow);
    this.deathsElem.innerHTML = new Intl.NumberFormat('ru-RU').format(this.deathsToShow);
    this.recoveredElem.innerHTML = new Intl.NumberFormat('ru-RU').format(this.recoveredToShow);
  }
}

module.exports = GlobalDataBlock;
