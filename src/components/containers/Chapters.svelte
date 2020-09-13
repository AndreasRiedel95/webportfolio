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

.outerbox
	height: 400px
	width: 400px
	position: relative
	margin-left: 20px
	margin-right: 20px

.box
	width: 100%
	height: 100%
	background: #e3e3e3
	position: relative
	overflow: hidden

.chapters
	display: flex
	width: 100%
	height: 100%


.chapter-header-wrapper
	background-color: #EBF0F2
	color: #000
	width: var(--headerWidth)
	flex-shrink: 0
	z-index: var(--i)
	position: relative
	padding-bottom: 30px
	display: flex
	flex-direction: column
	border-right: 0px solid #EBF0F2
	border-left: 1px solid #D2D7D9
	transition: border-color 0.7s ease-out
	&.locked
		transition: border-color 1s ease-out
		border-right: 1px solid #D2D7D9
		border-left: 0px solid #EBF0F2

.new-chapter-header
	transform: rotate(90deg) translate(1px)
	margin-top: 30px
	// text-transform: uppercase
	font-weight: 400
	font-size: 16px
	letter-spacing: 1px

.chapter-number
	display: flex
	flex-direction: column
	align-items: center
	margin-top: auto
	line-height: 1.2
	font-size: 16px
	font-weight: 600

.content
	display: flex
	z-index: 0
	align-items: center
	padding: 40px
	transition: transform 0.8s ease-out

.project-title
	font-family: 'Playfair Display', serif
	font-size: 50px
	line-height: 1
	text-transform: uppercase
	color: #d3d4d4
	text-align: center
	position: absolute
	top: 0
	z-index: 10
	left: 50%
	transform: translate(-50%, -50%)
	&.m--second-line
		color: #a0b6c3
		z-index: 15


.image
	object-fit: cover
	width: 100%
	height: 100%
	transition: transform 0.3s ease-out
	&:hover
		transform: scale(1.2)

section
	display: flex
	height: 100%
	position: absolute
	// 60 px for navbar
	left: calc(100vw - (var(--counter) - var(--i)) * var(--headerWidth) - var(--navWidth))
	top: 0
	width: calc(100vw - var(--sectionWidth))
	z-index: var(--i)
	background: #EBF0F2
	overflow: hidden
	transition: transform 0.7s ease-out
</style>

<div class="chapters">
	{#each templates as template, i}
		<section
			bind:offsetWidth={sectionWidth[i]}
			style="--i: {i + 1}; --counter: {templates.length + 1}; --sectionWidth: {headerTotalWidth + headerWidth / 2}px; --headerWidth: {headerWidth}px; --navWidth: {navWidth}px; transform: translate3d({locked[i] && locked[i].sectionTransform * -1}px,0,0)">
			<div class="chapter-header-wrapper" style="--headerWidth: {headerWidth}px" class:locked={locked[i].sectionLocked}>
				<div class="new-chapter-header">{template.headline}</div>
				<div class="chapter-number"><span>§</span> <span>0{i + 1}</span></div>
			</div>
			<div
				class="content"
				bind:clientWidth={contentWidth[i]}
				style="--i: {i + 1}; transform: translate3d({locked[i] && locked[i].contentTransform * -1}px,0,0)">
				{#each Array(template.content) as _}
					<div class="outerbox">
						<div class="project-title">Riedel <br /> <span class="project-title m--second-line">Andreas</span></div>
						<div class="box"><img class="image" src="/images/profil.jpg" alt="" /></div>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
