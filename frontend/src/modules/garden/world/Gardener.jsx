import { forwardRef } from 'react'

/**
 * Die Spielfigur von oben: Strohhut, Schultern, Hände, Füße.
 * Position und Drehung werden von außen direkt gesetzt (für flüssige 60 fps).
 */
const Gardener = forwardRef(function Gardener(_, ref) {
  return (
    <g ref={ref} className="gardener">
      <ellipse className="g-shadow" cx="5" cy="7" rx="24" ry="20" />
      <g className="g-body">
        <g className="g-feet">
          <ellipse className="g-foot l" cx="-8" cy="-2" rx="5.5" ry="8" />
          <ellipse className="g-foot r" cx="8" cy="-2" rx="5.5" ry="8" />
        </g>
        <ellipse className="g-shoulders" cx="0" cy="4" rx="21" ry="11" />
        <circle className="g-hand" cx="-19" cy="2" r="5" />
        <circle className="g-hand" cx="19" cy="2" r="5" />
        <circle className="g-hat-brim" r="17" />
        <circle className="g-hat-band" r="10.5" />
        <circle className="g-hat-top" r="9" />
        <ellipse cx="-3" cy="-4" rx="3.5" ry="2.2" fill="#fff" opacity=".35" />
      </g>
    </g>
  )
})

export default Gardener
