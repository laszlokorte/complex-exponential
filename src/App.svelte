<script>
  import Exponential from "./Exponential.svelte";
  import { Canvas, Layer, t } from "svelte-canvas";


	const formatter = new Intl.NumberFormat(navigator.locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  let w = 0, h = 0;
  let growth = 0
  let freq = 0
  let perspective = true

</script>

<style>
	.container {
		display: grid;
		grid-template-columns: [all-start intro-start gl-start] minmax(min-content,1fr) minmax(min-content,1fr) minmax(min-content,2fr) [gl-end intro-end right-start] minmax(min-content,2fr) [right-end all-end];
		grid-template-rows: [all-start right-start gl-start intro-start] 1fr 1fr 1fr  [intro-end gl-end all-end right-end];
		gap:  1em;
		box-sizing: border-box;
		height: 100%;
		justify-items: stretch;
	}


	:global(body, html, #root) {
		height: 100%;
	}

	.intro {
		grid-area: intro;
		align-self: stretch;
		justify-self: stretch;
		pointer-events: none;
		font-style: italic;
		color: #888;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scalebase {
		grid-area: intro;
		pointer-events: none;	
		align-self: stretch;
		justify-self: stretch;
	}

	.menu {
		grid-area: right;
		overflow: hidden;
		overflow-y:  auto;
		max-height: 100%;
		max-width: 100%;
		box-sizing: border-box;
		pointer-events: none;
		justify-self: flex-end;
	}

	.menu-inner {
		background-color: #fffa;
		pointer-events: all;
		padding: 1em 2em 1em 1em;
		pointer-events: all;
	}

	:global(canvas) {
		grid-area: all;
		width: 100%;
		height: 100%;
		max-width: 100%;
	}

	:global(.gl) {
		grid-area: gl;
		width: 100%;
		height: 100%;
	}

	:global(body) {
		margin: 0;
		padding:  0;
	}

	dl {
		display: grid;
		grid-template-columns: [full-start key-start] max-content [key-end control-start] auto [control-end value-start] auto [value-end full-end];
		gap: 0.1em 1em;
		align-items: center;
		margin:  0;
	}

	dt {
		grid-column: key;
		text-align: right;
	}

	dd {
		margin: 0;
		justify-self: end;
		text-align: right;
	}

	.plainlist  {
		list-style: none;
		margin:0;
		padding: 0;
	}

  input {
    margin: 0;
  }

  input[type=range] {
  	padding: 0.5em 0.4em 0.5em;
  	margin:  0.5em 0 0;
  }

  .hidden {
  	display: none !important;
  }

  footer {
  	margin: 2em 0;
  	text-align: center;
  	pointer-events: all;
  }


	@media(max-width: 60em) {
		.container {
			grid-template-columns: [all-start intro-start gl-start right-start] 1fr [right-end all-end gl-end intro-end];
			grid-template-rows: [all-start gl-start intro-start] 60vmin [intro-end gl-end all-end right-start] auto  [right-end];
			height: unset;
			gap:  0;
			max-height: unset;
			align-items: stretch;
		}

		.menu {
			height: unset;
		}
	}
</style>

<div class="container">
	  <Exponential class="gl" {growth} {freq} {perspective} />
	  <div class="menu">
	  	<div class="menu-inner">
	  		<h2><span style="font-weight: normal; font-family: serif;">e<sup>(a + b&middot;2&pi;𝑖)&middot;n</sup></span></h2>
	  		<p>
	  			= <span style="font-size: 1.5em;">(</span><span style="font-weight: normal; font-family: serif;">e<sup>(a + b&middot;2&pi;𝑖)</sup></span><span style="font-size: 1.5em;">)</span><sup><sup>n</sup></sup><br>
	  			= <span style="font-size: 1.5em;">(</span><span style="font-weight: normal; font-family: serif;">e<sup>a</sup></span> &middot; <span style="font-weight: normal; font-family: serif;">e<sup>b&middot;2&pi;𝑖</sup></span><span style="font-size: 1.5em;">)</span><sup><sup>n</sup></sup><br>
	  			= <span style="font-size: 1.5em;">(</span><span style="font-weight: normal; font-family: serif;">e<sup>a</sup></span><span style="font-size: 1.5em;">)</span><sup><sup>n</sup></sup> &middot; <span style="font-size: 1.5em;">(</span><span style="font-weight: normal; font-family: serif;">e<sup>b&middot;2&pi;𝑖</sup></span><span style="font-size: 1.5em;">)</span><sup><sup>n</sup></sup>
	  		</p>
	  		<dl>
	  			<dt><label for="growth">Growth (a)</label></dt>
	  			<dd><input id="growth" type="range" min="-8" max="8" step="0.01" bind:value={growth} /></dd>
	  			<dd><input type="text" size="4" value={formatter.format(growth)} on:change={(evt) => {growth = Math.max(-8, Math.min(8, parseFloat(evt.target.value) || 0))}} />
	  				<button on:click={() => { growth = 0 }}>🗑</button>
	  			</dd>

	  			<dt><label for="freq">Frequency (b)</label></dt>
	  			<dd><input id="freq" type="range" min="-32" max="32" step="1" bind:value={freq} /></dd>
	  			<dd><input type="text" size="4" value={freq} on:change={(evt) => {freq = Math.max(-32, Math.min(32, parseInt(evt.target.value, 10) || 0))}} />
	  				<button on:click={() => { freq = 0 }}>🗑</button></dd>
	  			
	  			<dt>Perpective</dt>
	  			<dd style="column: span 2; display: flex; justify-content: start; justify-self: flex-start;gap: 1em;">
	  				<label style="padding: 0.5em 0"><input type="radio" bind:group={perspective} value={false} /> No</label>
	  				<label style="padding: 0.5em 0"><input type="radio" bind:group={perspective} value={true} /> Yes</label>
	  			</dd>
	  		</dl>
	  		<p>
	  			Raising a Complex Number to the nth power traces a helix path. The imarinary component determines the winding frequency. The real component determines the growth of the radius. 
	  		</p>
	  		<h2>z-Plane</h2>
	  		<p>
	  			The z-Plane a wrapped up variation of the complex number plane plane.
	  		</p>
	  		<svg viewBox="-100 -50 200 100" stroke-linecap="round">

	  			<line x1="0" y1="40" x2={0} y2={-40} stroke="#ccc"stroke-width="0.5" />
	  			<line y1="0" x1="40" y2={0} x2={-40} stroke="#ccc"stroke-width="0.5" />
	  			<text x={0} y={-45} font-size="5" text-anchor="middle" dominant-baseline="middle">Im</text>
	  			<text y={0} x={45} font-size="5" text-anchor="middle" dominant-baseline="middle">Re</text>
	  			<circle cx="0" cy="0" r="30" stroke-dasharray="5 5" fill="none" stroke="#ccc" stroke-width="0.5" />
	  			<line x1="0" y1="0" x2={30 * Math.exp(growth/8) * Math.cos(-freq / 32 * Math.PI)} y2={30 * Math.exp(growth/8) * Math.sin(-freq / 32 * Math.PI)} stroke="#0ac"stroke-width="1" />
	  		</svg>
	  	</div>
	  	<footer>
	  		<a href="https://tools.laszlokorte.de">More educational tools</a>
	  	</footer>
	  </div>
</div>