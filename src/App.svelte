<script>
	import { onMount } from 'svelte';
	import Navbar from './components/layouts/Navbar.svelte';
	import Chapters from './components/containers/Chapters.svelte';
	import { claim_component } from 'svelte/internal';
	let maxWidth;
	let delta;
	let transform = 0;
	let stop = false;
	const mulitplicator = 10;

	let lockedTemplates = [];
	let widthCounter = 0;
	let scrollObject = [];
	let templates = [
		{ id: 'about', headline: 'A', content: 3 },
		{ id: 'projects', headline: 'P', content: 2 },
		{ id: 'contact', headline: 'C', content: 5 },
	];
	let locked = templates.map((_) => ({
		sectionTransform: 0,
		contentTransform: 0,
		section: false,
		content: false,
		contentPreLocked: false,
	}));

	const handleWheel = (e) => {
		delta = mulitplicator * -1 * Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
		if (!stop) {
			if (transform <= 0 && delta < 0) {
				transform = 0;
			} else {
				transform = transform + delta;
			}
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

	$: console.log(scrollObject);

	$: if (scrollObject && delta && transform) {
		console.log(transform);
		for (let i = 0; i < scrollObject.length; i++) {
			if (i === 0) {
				if (transform >= scrollObject[i].section) {
					locked[i].section = true;
					locked[i].sectionTransform = scrollObject[i].section;
				}
				if (transform < scrollObject[i].section) {
					locked[i].section = false;
					locked[i].sectionTransform += delta;
					if (locked[i].sectionTransform <= mulitplicator && delta < 0) {
						locked[i].sectionTransform = 0;
					}
				}
				if (
					transform < accumulateWidth('content', i) &&
					transform < accumulateWidth('content', i) - maxWidth + 120 &&
					locked[i].section
				) {
					locked[i].content = false;
					locked[i].contentPreLocked = false;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (
					transform > accumulateWidth('content', i) - maxWidth + 120 &&
					transform < accumulateWidth('content', i) &&
					locked[i].section
				) {
					locked[i].content = false;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (transform >= accumulateWidth('content', i) && locked[i + 1] && !locked[i + 1].section) {
					locked[i].content = true;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform = scrollObject[i].content;
				}
			} else {
				if (
					transform >= accumulateWidth('section', i) - (maxWidth + 120) * (i + 1) &&
					locked[i - 1] &&
					locked[i - 1].content &&
					locked[i - 1].contentPreLocked
				) {
					locked[i].section = true;
					locked[i].sectionTransform = scrollObject[i].section;
				}
				if (
					transform < accumulateWidth('section', i) &&
					locked[i - 1] &&
					locked[i - 1].contentPreLocked &&
					!locked[i - 1].content
				) {
					locked[i].section = false;
					locked[i].sectionTransform += delta;
					if (locked[i].sectionTransform <= mulitplicator && delta < 0) {
						locked[i].sectionTransform = 0;
					}
				}
				if (
					transform < accumulateWidth('content', i) &&
					transform < accumulateWidth('content', i) - (maxWidth - 120) * (i + 1) &&
					locked[i].section
				) {
					locked[i].content = false;
					locked[i].contentPreLocked = false;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (
					transform > accumulateWidth('content', i) - (maxWidth - 120) * (i + 1) &&
					transform < accumulateWidth('content', i) &&
					transform < accumulateWidth('content', i) - (maxWidth - 120) * i &&
					locked[i].section
				) {
					locked[i].content = false;
					locked[i].contentPreLocked = true;
					locked[i].contentTransform += delta;
					if (locked[i].contentTransform <= mulitplicator && delta < 0) {
						locked[i].contentTransform = 0;
					}
				}
				if (
					transform >= accumulateWidth('content', i) - (maxWidth - 120) * i &&
					locked[i + 1] &&
					!locked[i + 1].section
				) {
					console.log('CONTENT LOCK ME');
					locked[i].content = true;
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

.content-wrapper
  display: flex
  width: 100%

</style>

<svelte:window on:wheel={handleWheel} />
<main class="wrapper">
	<Navbar />
	<div class="content-wrapper" bind:clientWidth={maxWidth}>
		<div class="home-wrapper" style="width: {maxWidth - 120 - transform}px">
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda eum nisi dolorum nobis repellendus iste eaque
			ducimus tempore esse. Dolorem iste sint ab culpa cupiditate veritatis illo maiores, quisquam modi!
		</div>

		<Chapters {locked} {templates} on:width={(e) => (scrollObject = e.detail)} />
	</div>
</main>
