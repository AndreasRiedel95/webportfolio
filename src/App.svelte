<script>
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Navbar from './components/layouts/Navbar.svelte';
	import Chapters from './components/containers/Chapters.svelte';
	import { claim_component } from 'svelte/internal';

	let maxWidth;
	let maxScrollWidth = 0;
	let delta;
	let touchX = 0;
	let w;
	let transform = 0;
	const navWidth = 60;
	const headerWidth = 40;
	let mulitplicator = 10;
	let lockedTemplates = [];
	let widthCounter = 0;
	let scrollObject = null;
	let name = 'NOOO';
	let templates = [
		{ id: 'about', headline: 'About', content: 3 },
		{ id: 'projects', headline: 'Projects', content: 2 },
		{ id: 'contact', headline: 'Contact', content: 5 },
	];
	const headerTotalWidth = headerWidth * templates.length;
	let locked = templates.map((_) => ({
		sectionTransform: 0,
		contentTransform: 0,
		sectionLocked: false,
		contentLocked: false,
		contentPreLocked: false,
	}));

	function handleTouchStart(e) {
		mulitplicator = 50;
		touchX = e.touches[0].pageX;
	}

	const handleTouchMove = (e) => {
		let touchDelta = touchX - e.touches[0].pageX;
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
		w = maxWidth - headerTotalWidth - transform;
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
					transform >= accumulateWidth('section', i) - (maxWidth - headerTotalWidth) * (i + 1) &&
					locked[i - 1] &&
					locked[i - 1].contentLocked &&
					locked[i - 1].contentPreLocked
				) {
					locked[i].sectionLocked = true;
					locked[i].sectionTransform = scrollObject[i].section;
				}
				if (
					transform < accumulateWidth('section', i) &&
					transform >= accumulateWidth('section', i) - (maxWidth - headerTotalWidth) * (i + 1) &&
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
					locked[i].contentLocked = true;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform = scrollObject[i].content;
				}
			}
		}
	}
</script>

<style type="text/scss">
	.wrapper {
		height: 100vh;
		display: flex;
		position: relative;
		overflow: hidden;
	}

	.home-wrapper {
		width: calc(100vw - 180px);
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		min-width: 700px;
		padding: 80px;
	}

	.headline {
		font-size: 50px;
		line-height: 1;
		font-weight: 600;
		&.m--bold {
			font-weight: 800;
			letter-spacing: 1px;
		}
	}

	.content-wrapper {
		display: flex;
		width: 100%;
	}

	.sub-title {
		margin-top: 20px;
		line-height: 1.5;
		font-weight: 600;
		color: #383838;
	}

	.intro-text {
		margin-top: auto;
		margin-left: auto;
		max-width: 400px;
		width: 100%;
		text-align: right;
	}
</style>

<svelte:body on:wheel={handleWheel} on:touchstart={handleTouchStart} on:touchmove={handleTouchMove} />
<main class="wrapper">
	<Navbar {navWidth} {w} />
	<div class="content-wrapper" bind:clientWidth={maxWidth}>
		<div class="home-wrapper" style="width: {w}px">
			<div class="headline-wrapper">
				<div class="headline m--bold">Don't be boring!</div>
				<div class="headline">Let's create something</div>
				<div class="headline">fun together!</div>
				<div class="sub-title">Digital and Print. <br /> Creative developer from Stuttgart.</div>
			</div>
			<div class="intro-text">
				Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corrupti aut nesciunt fuga harum ut, distinctio sed
				tenetur debitis maiores voluptas. Dolores ipsam perspiciatis obcaecati a ducimus totam. Quo, animi architecto.
				Lorem ipsum, dolor sit amet consectetur adipisicing elit.
			</div>
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
