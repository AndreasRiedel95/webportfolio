<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let templates;
	export let headerWidth;
	export let navWidth;
	export let headerTotalWidth;
	export let locked = [];
	let sectionWidth = [];
	let contentWidth = [];
	let transform = 0;

	$: if (sectionWidth && contentWidth && sectionWidth.length === contentWidth.length) {
		let widthObject = sectionWidth.map((e, i) => ({ section: e - 40, content: contentWidth[i] }));
		dispatch('width', widthObject);
	}

	const calculateTransform = (tr, j) => {
		console.log('IN');
		let idx = j - 1;
		let sectionTransform = 0;

		while (idx >= 0) {
			sectionTransform += sectionWidth[idx];
			idx--;
		}
		sectionTransform = tr * -1 + sectionTransform;
		sectionTransform > 0 ? (sectionTransform = 0) : (sectionTransform = sectionTransform);
		transform = sectionTransform;
		return sectionTransform;
	};
</script>

<style type="text/sass">
.box
	height: 400px
	width: 400px
	background: yellow
	margin-left: 20px
	margin-right: 20px

.chapters
	display: flex
	width: 100%
	height: 100%

.chapter-header-wrapper
	background: violet
	width: var(--headerWidth)
	flex-shrink: 0
	z-index: var(--i)

.new-chapter-header
  // transform: rotate(90deg)

.content
	display: flex
	z-index: 0
	align-items: center
	padding: 40px
	transition: transform 0.7s ease-out

section
	display: flex
	height: 100%
	position: absolute
	// 60 px for navbar
	left: calc(100vw - (var(--counter) - var(--i)) * var(--headerWidth) - var(--navWidth))
	top: 0
	width: calc(100vw - var(--sectionWidth))
	z-index: var(--i)
	background: grey
	overflow: hidden
	transition: transform 0.7s ease-out
</style>

<div class="chapters">
	{#each templates as template, i}
		<section
			bind:offsetWidth={sectionWidth[i]}
			style="--i: {i + 1}; --counter: {templates.length + 1}; --sectionWidth: {headerTotalWidth + headerWidth / 2}px; --headerWidth: {headerWidth}px; --navWidth: {navWidth}px; transform: translate3d({locked[i] && locked[i].sectionTransform * -1}px,0,0)">
			<div class="chapter-header-wrapper" style="--headerWidth: {headerWidth}px">
				<div class="new-chapter-header">{template.headline}</div>
			</div>
			<div
				class="content"
				bind:clientWidth={contentWidth[i]}
				style="--i: {i + 1}; transform: translate3d({locked[i] && locked[i].contentTransform * -1}px,0,0)">
				{#each Array(template.content) as _}
					<div class="box" />
				{/each}
			</div>
		</section>
	{/each}
</div>
