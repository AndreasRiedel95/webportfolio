<script>
	import { onMount } from 'svelte';
	import Navbar from './components/layouts/Navbar.svelte';
	import Chapters from './components/containers/Chapters.svelte';
	import { claim_component } from 'svelte/internal';
	let maxWidth;
	let maxScrollWidth = 0;
	let delta;
	let touchY = 0;
	let transform = 0;
	const navWidth = 60;
	const headerWidth = 40;
	const mulitplicator = 10;
	let lockedTemplates = [];
	let widthCounter = 0;
	let scrollObject = null;
	let templates = [
		{ id: 'about', headline: 'A', content: 3 },
		{ id: 'projects', headline: 'P', content: 2 },
		{ id: 'contact', headline: 'C', content: 5 },
		{ id: 'reader', headline: 'r', content: 3 },
	];
	const headerTotalWidth = headerWidth * templates.length;
	let locked = templates.map((_) => ({
		sectionTransform: 0,
		contentTransform: 0,
		sectionLocked: false,
		contentLocked: false,
		contentPreLocked: false,
	}));

	const handleTouchStart = (e) => {
		mulitplicator = 20;
		touchY = e.touches[0].pageY;
	};

	const handleTouchMove = (e) => {
		let touchDelta = touchY - e.touches[0].pageY;
		if (touchDelta > 0) {
			delta = 1;
		} else {
			delta = -1;
		}
		delta = delta * mulitplicator;
		if (transform <= 0 && delta < 0) {
			transform = 0;
		} else if (transform >= maxScrollWidth && delta > 0) {
			transform = maxScrollWidth;
		} else {
			transform = transform + delta;
		}
	};

	const handleWheel = (e) => {
		delta = mulitplicator * -1 * Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
		if (transform <= 0 && delta < 0) {
			transform = 0;
		} else if (transform >= maxScrollWidth && delta > 0) {
			transform = maxScrollWidth;
		} else {
			transform = transform + delta;
		}
	};

	const accumulateWidth = (param, i) => {
		let sectionTransform = 0;
		let idx = 0;
		while (idx <= i) {
			if (idx === i && param === 'content') {
				sectionTransform = sectionTransform + scrollObject[idx].section + scrollObject[idx].content;
			} else if (idx === i && param === 'section') {
				sectionTransform = sectionTransform + scrollObject[idx].section;
			} else {
				sectionTransform = sectionTransform + scrollObject[idx].section + scrollObject[idx].content;
			}
			idx++;
		}
		return sectionTransform;
	};

	$: if (scrollObject) {
		maxScrollWidth = scrollObject.reduce((acc, curr) => (acc += curr.content), 0);
	}

	$: if (scrollObject && delta && transform) {
		for (let i = 0; i < scrollObject.length; i++) {
			if (i === 0) {
				if (transform >= scrollObject[i].section) {
					locked[i].sectionLocked = true;
					locked[i].sectionTransform = scrollObject[i].section;
				}
				if (transform < scrollObject[i].section) {
					locked[i].sectionLocked = false;
					locked[i].sectionTransform += delta;
					if (locked[i].sectionTransform <= mulitplicator && delta < 0) {
						locked[i].sectionTransform = 0;
					}
				}
				if (
					transform < accumulateWidth('content', i) &&
					transform < accumulateWidth('content', i) - maxWidth + headerTotalWidth &&
					locked[i].sectionLocked
				) {
					locked[i].contentLocked = false;
					locked[i].contentPreLocked = false;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (
					transform > accumulateWidth('content', i) - maxWidth + headerTotalWidth &&
					transform < accumulateWidth('content', i) &&
					locked[i].sectionLocked
				) {
					locked[i].contentLocked = false;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (transform >= accumulateWidth('content', i) && locked[i + 1] && !locked[i + 1].sectionLocked) {
					locked[i].contentLocked = true;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform = scrollObject[i].content;
				}
			} else {
				if (
					transform >= accumulateWidth('section', i) - (maxWidth + headerTotalWidth) * (i + 1) &&
					locked[i - 1] &&
					locked[i - 1].contentLocked &&
					locked[i - 1].contentPreLocked
				) {
					locked[i].sectionLocked = true;
					locked[i].sectionTransform = scrollObject[i].section;
				}
				if (
					transform < accumulateWidth('section', i) &&
					locked[i - 1] &&
					locked[i - 1].contentPreLocked &&
					!locked[i - 1].contentLocked
				) {
					locked[i].sectionLocked = false;
					locked[i].sectionTransform += delta;
					if (locked[i].sectionTransform <= mulitplicator && delta < 0) {
						locked[i].sectionTransform = 0;
					}
				}
				if (
					transform < accumulateWidth('content', i) &&
					transform < accumulateWidth('content', i) - (maxWidth - headerTotalWidth) * (i + 1) &&
					locked[i].sectionLocked
				) {
					locked[i].contentLocked = false;
					locked[i].contentPreLocked = false;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (
					transform > accumulateWidth('content', i) - (maxWidth - headerTotalWidth) * (i + 1) &&
					transform < accumulateWidth('content', i) &&
					transform < accumulateWidth('content', i) - (maxWidth - headerTotalWidth) * i &&
					locked[i].sectionLocked
				) {
					locked[i].contentLocked = false;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (
					transform >= accumulateWidth('content', i) - (maxWidth - headerTotalWidth) * i &&
					locked[i + 1] &&
					!locked[i + 1].sectionLocked
				) {
					console.log('CONTENT LOCK ME');
					locked[i].contentLocked = true;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform = scrollObject[i].content;
				}
			}
		}
	}
</script>

<style type="text/sass">
.wrapper
  height: 100vh
  background: red
  display: flex
  position: relative
  overflow: hidden

.home-wrapper
  width: calc(100vw - 180px)
  background: green
  flex-shrink: 0
  display: flex
  transition: width 0.7s ease-out

.content-wrapper
  display: flex
  width: 100%

</style>

<svelte:window on:wheel={handleWheel} on:touchstart={handleTouchStart} on:touchmove={handleTouchMove} />
<main class="wrapper">
	<Navbar {navWidth} />
	<div class="content-wrapper" bind:clientWidth={maxWidth}>
		<div class="home-wrapper" style="width: {maxWidth - headerTotalWidth - transform}px">
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda eum nisi dolorum nobis repellendus iste eaque
			ducimus tempore esse. Dolorem iste sint ab culpa cupiditate veritatis illo maiores, quisquam modi!
		</div>

		<Chapters
			{locked}
			{templates}
			{headerWidth}
			{navWidth}
			{headerTotalWidth}
			on:width={(e) => (scrollObject = e.detail)} />
	</div>
</main>
