// Farbverläufe für Pflanzen. Die Farben kommen aus CSS-Variablen,
// dadurch passen sie sich automatisch an helles/dunkles Design an.
const stop = (offset, color) => <stop offset={offset} style={{ stopColor: `var(${color})` }} />

function GardenDefs() {
  return (
    <defs>
      <radialGradient id="gd-crown" cx=".36" cy=".3" r=".78">
        {stop(0, '--crown-light')}{stop(0.55, '--crown-mid')}{stop(1, '--crown-dark')}
      </radialGradient>
      <radialGradient id="gd-crown-kirsche" cx=".36" cy=".3" r=".78">
        {stop(0, '--cherry-light')}{stop(0.55, '--cherry-mid')}{stop(1, '--cherry-dark')}
      </radialGradient>
      <radialGradient id="gd-crown-birke" cx=".36" cy=".3" r=".78">
        {stop(0, '--birch-light')}{stop(0.55, '--birch-mid')}{stop(1, '--birch-dark')}
      </radialGradient>
      <linearGradient id="gd-fir" x1="0" y1="0" x2="1" y2="0">
        {stop(0, '--fir-light')}{stop(1, '--fir-dark')}
      </linearGradient>
      <linearGradient id="gd-leaf" x1="0" y1="1" x2="1" y2="0">
        {stop(0, '--crown-mid')}{stop(1, '--crown-light')}
      </linearGradient>
      <linearGradient id="gd-trunk" x1="0" y1="0" x2="1" y2="0">
        {stop(0, '--bark')}{stop(1, '--bark-dark')}
      </linearGradient>
      <linearGradient id="gd-birch" x1="0" y1="0" x2="1" y2="0">
        {stop(0, '--birch-bark')}{stop(1, '--birch-bark-dark')}
      </linearGradient>
    </defs>
  )
}

export default GardenDefs
