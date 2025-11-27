<!--
  Canvas Component
  Main content area displaying all racks in a horizontal layout
-->
<script lang="ts">
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getUIStore } from '$lib/stores/ui.svelte';
	import Rack from './Rack.svelte';
	import EmptyState from './EmptyState.svelte';

	interface Props {
		onnewrack?: () => void;
		onrackselect?: (event: CustomEvent<{ rackId: string }>) => void;
		ondeviceselect?: (event: CustomEvent<{ libraryId: string; position: number }>) => void;
		ondevicedrop?: (
			event: CustomEvent<{ rackId: string; libraryId: string; position: number }>
		) => void;
	}

	let { onnewrack, onrackselect, ondeviceselect, ondevicedrop }: Props = $props();

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();

	// Sort racks by position
	const sortedRacks = $derived([...layoutStore.racks].sort((a, b) => a.position - b.position));
	const hasRacks = $derived(layoutStore.rackCount > 0);

	function handleCanvasClick(event: MouseEvent) {
		// Only clear selection if clicking directly on the canvas (not on a rack)
		if (event.target === event.currentTarget) {
			selectionStore.clearSelection();
		}
	}

	function handleRackSelect(event: CustomEvent<{ rackId: string }>) {
		selectionStore.selectRack(event.detail.rackId);
		onrackselect?.(event);
	}

	function handleDeviceSelect(
		event: CustomEvent<{ libraryId: string; position: number }>,
		rackId: string
	) {
		// Find the device index in the rack
		const rack = layoutStore.racks.find((r) => r.id === rackId);
		if (rack) {
			const deviceIndex = rack.devices.findIndex(
				(d) => d.libraryId === event.detail.libraryId && d.position === event.detail.position
			);
			if (deviceIndex !== -1) {
				selectionStore.selectDevice(rackId, deviceIndex, event.detail.libraryId);
			}
		}
		ondeviceselect?.(event);
	}

	function handleNewRack() {
		onnewrack?.();
	}

	function handleDeviceDrop(
		event: CustomEvent<{ rackId: string; libraryId: string; position: number }>
	) {
		const { rackId, libraryId, position } = event.detail;
		layoutStore.placeDevice(rackId, libraryId, position);
		ondevicedrop?.(event);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="canvas" onclick={handleCanvasClick}>
	{#if hasRacks}
		<div class="rack-row">
			{#each sortedRacks as rack (rack.id)}
				<Rack
					{rack}
					deviceLibrary={layoutStore.deviceLibrary}
					selected={selectionStore.selectedType === 'rack' && selectionStore.selectedId === rack.id}
					zoom={uiStore.zoom}
					selectedDeviceId={selectionStore.selectedType === 'device'
						? selectionStore.selectedId
						: null}
					onselect={(e) => handleRackSelect(e)}
					ondeviceselect={(e) => handleDeviceSelect(e, rack.id)}
					ondevicedrop={(e) => handleDeviceDrop(e)}
				/>
			{/each}
		</div>
	{:else}
		<EmptyState onnewrack={handleNewRack} />
	{/if}
</div>

<style>
	.canvas {
		flex: 1;
		display: flex;
		align-items: flex-end;
		justify-content: flex-start;
		overflow-x: auto;
		overflow-y: auto;
		padding: 24px;
		background-color: var(--colour-bg, #1a1a1a);
		min-height: 0;
	}

	.rack-row {
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		gap: 24px;
		padding-bottom: 16px;
	}
</style>
